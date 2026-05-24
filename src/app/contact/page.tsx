"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Send,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  Newspaper,
  Briefcase,
  Bug,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const TOPICS = [
  { value: "general", label: "General question" },
  { value: "sales", label: "Sales — Team or Enterprise" },
  { value: "press", label: "Press / media inquiry" },
  { value: "support", label: "Help with my account" },
  { value: "bug", label: "Bug report" },
  { value: "security", label: "Security disclosure" },
  { value: "partnership", label: "Partnership / integration" },
];

const FAST_LANES = [
  {
    icon: HelpCircle,
    title: "Just want to ask something?",
    body: "Most questions get answered in our docs or the FAQ on the pricing page.",
    cta: { href: "/docs", label: "Browse docs" },
  },
  {
    icon: Newspaper,
    title: "Writing about DocketLens?",
    body: "Press kit has logos, founder quote, boilerplate, and a contact you can quote.",
    cta: { href: "/press", label: "Open press kit" },
  },
  {
    icon: Briefcase,
    title: "Team or Enterprise pricing?",
    body: "Self-serve Team is $199/mo on the pricing page. For Enterprise specifics, use the form below with topic = Sales.",
    cta: { href: "/pricing", label: "See pricing" },
  },
  {
    icon: Bug,
    title: "Found a bug?",
    body: "Use the form with topic = Bug. Include the URL, the browser, and what you expected.",
    cta: null,
  },
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("general");
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !body) {
      toast.error("Missing fields", {
        description: "Name, email, and message are required.",
      });
      return;
    }

    setPending(true);
    // Resend wire-up lands Tuesday — for now we simulate the round trip
    await new Promise((r) => setTimeout(r, 700));
    setPending(false);
    setSubmitted(true);
    toast.success("Sent", {
      description: "We'll reply to " + email + " within 24 hours.",
    });
  }

  function reset() {
    setName("");
    setEmail("");
    setTopic("general");
    setBody("");
    setSubmitted(false);
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-6 pt-16 md:pt-24 pb-12">
          <p className="eyebrow mb-4">Contact</p>
          <h1 className="display-1 max-w-3xl">
            We&apos;re a small team and we{" "}
            <span className="italic text-[color:var(--color-accent)]">
              read everything.
            </span>
          </h1>
          <p className="mt-6 text-lg text-[color:var(--color-fg-muted)] leading-relaxed max-w-2xl">
            Most questions land in the inbox of one person — the founder — and
            get a real reply within 24 hours. Pick the topic that fits and
            we&apos;ll route from there.
          </p>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-20 grid lg:grid-cols-[1.3fr_1fr] gap-10">
          {/* Form */}
          <Card className="p-8 md:p-10">
            {submitted ? (
              <div className="flex flex-col items-center text-center py-8">
                <div className="flex size-14 items-center justify-center rounded-full bg-[color:var(--color-success)]/15 text-[color:var(--color-success)] mb-5">
                  <CheckCircle2 className="size-6" />
                </div>
                <h2 className="font-serif text-2xl tracking-tight">
                  Thanks — we got it.
                </h2>
                <p className="mt-3 text-[color:var(--color-fg-muted)] max-w-md leading-relaxed">
                  We&apos;ll reply to{" "}
                  <span className="font-mono text-[color:var(--color-fg)]">
                    {email}
                  </span>{" "}
                  within 24 hours, usually sooner. If you&apos;re on the West
                  Coast and you sent this overnight, expect a reply by lunch.
                </p>
                <div className="mt-6 flex gap-2">
                  <Button variant="outline" onClick={reset}>
                    Send another
                  </Button>
                  <Button asChild variant="accent">
                    <Link href={"/" as never}>Back home</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="flex flex-col gap-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Your name">
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      required
                      placeholder="Jane Doe"
                    />
                  </Field>
                  <Field label="Email">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                      placeholder="you@firm.com"
                    />
                  </Field>
                </div>

                <Field label="Topic">
                  <Select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  >
                    {TOPICS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Message">
                  <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    required
                    rows={7}
                    placeholder="What's on your mind? Links and screenshots are welcome — paste away."
                  />
                </Field>

                {topic === "security" && (
                  <div className="rounded-[var(--radius-md)] border border-[color:var(--color-warning)]/30 bg-[color:var(--color-warning)]/10 p-3 text-xs text-[color:var(--color-fg-muted)] leading-relaxed flex items-start gap-2">
                    <ShieldCheck className="size-3.5 mt-0.5 text-[color:var(--color-warning)] shrink-0" />
                    <span>
                      For security disclosures, we prefer encrypted mail.
                      Email <code>security@docketlens.ai</code> directly with
                      our PGP key (in the response to your first message).
                      We&apos;ll triage within 24 hours.
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 pt-2">
                  <p className="text-xs text-[color:var(--color-fg-muted)] flex items-center gap-1.5">
                    <Clock className="size-3 text-[color:var(--color-fg-subtle)]" />
                    Typical reply: under 24h
                  </p>
                  <Button
                    type="submit"
                    variant="accent"
                    size="lg"
                    disabled={pending}
                  >
                    {pending ? (
                      <>
                        <Sparkles className="size-4 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send className="size-4" />
                        Send message
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </Card>

          {/* Fast lanes */}
          <aside className="flex flex-col gap-4">
            <Card className="p-5 bg-gradient-to-br from-[color:var(--color-accent-soft)]/30 to-transparent">
              <div className="flex items-start gap-3">
                <div className="flex size-9 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] shadow-soft">
                  <Mail className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Email directly</p>
                  <p className="mt-1 font-mono text-xs">
                    <a
                      href="mailto:hello@docketlens.ai"
                      className="text-[color:var(--color-fg)] hover:text-[color:var(--color-accent)] underline underline-offset-4"
                    >
                      hello@docketlens.ai
                    </a>
                  </p>
                  <p className="mt-2 text-xs text-[color:var(--color-fg-muted)] leading-relaxed">
                    The form goes here too — pick whichever you prefer.
                  </p>
                </div>
              </div>
            </Card>

            <p className="eyebrow mt-2">Fast lanes</p>
            {FAST_LANES.map((l) => (
              <Card key={l.title} className="p-5 flex items-start gap-3">
                <div className="flex size-9 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-bg-subtle)] border border-[color:var(--color-border)] shrink-0">
                  <l.icon className="size-4 text-[color:var(--color-fg-muted)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{l.title}</p>
                  <p className="mt-1 text-xs text-[color:var(--color-fg-muted)] leading-relaxed">
                    {l.body}
                  </p>
                  {l.cta && (
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="mt-2 -ml-2"
                    >
                      <Link href={l.cta.href as never}>{l.cta.label}</Link>
                    </Button>
                  )}
                </div>
              </Card>
            ))}

            <Card className="p-5">
              <p className="eyebrow mb-3">Office hours</p>
              <ul className="text-xs leading-relaxed text-[color:var(--color-fg-muted)] flex flex-col gap-1.5">
                <li className="flex items-center justify-between">
                  <span>Mon–Fri</span>
                  <Badge variant="success" className="text-[10px]">
                    9am–6pm PT
                  </Badge>
                </li>
                <li className="flex items-center justify-between">
                  <span>Saturday</span>
                  <Badge variant="default" className="text-[10px]">
                    best-effort
                  </Badge>
                </li>
                <li className="flex items-center justify-between">
                  <span>Sunday</span>
                  <Badge variant="default" className="text-[10px]">
                    closed
                  </Badge>
                </li>
              </ul>
            </Card>
          </aside>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-[color:var(--color-fg-muted)]">
        {label}
      </label>
      {children}
    </div>
  );
}
