"use client";

import Link from "next/link";
import { ArrowUpRight, ScrollText } from "lucide-react";
import { Topbar } from "@/components/app/topbar";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { WebhookSigningCard } from "@/components/app/webhook-signing-card";
import { SAMPLE_AUDIT_EVENTS } from "@/lib/sample-audit";
import { timeAgo } from "@/lib/utils";

function SettingsAuditPreview() {
  const recent = [...SAMPLE_AUDIT_EVENTS]
    .sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    )
    .slice(0, 10);
  return (
    <div className="mt-2">
      <div className="flex items-end justify-between gap-3 mb-2">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-fg-subtle)]">
            Recent audit events
          </p>
          <p className="text-xs text-[color:var(--color-fg-muted)] mt-0.5">
            Last 10 across the org — full timeline + CSV export at /audit-log.
          </p>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href={"/audit-log" as never}>
            <ScrollText className="size-3.5" />
            Open audit log
            <ArrowUpRight className="size-3" />
          </Link>
        </Button>
      </div>
      <div className="rounded-[var(--radius-md)] border border-[color:var(--color-border)] overflow-hidden">
        <ul className="divide-y divide-[color:var(--color-border)]">
          {recent.map((e) => (
            <li
              key={e.id}
              className="px-3 py-2 flex items-center gap-3 text-[12px]"
            >
              <code className="font-mono text-[11px] text-[color:var(--color-fg)] truncate max-w-[200px]">
                {e.action}
              </code>
              <span className="text-[color:var(--color-fg-muted)] truncate min-w-0 flex-1">
                {e.actor.name}
                {e.target ? (
                  <>
                    {" "}
                    <span className="text-[color:var(--color-fg-subtle)]">
                      →
                    </span>{" "}
                    {e.target}
                  </>
                ) : null}
              </span>
              <span className="font-mono text-[10.5px] text-[color:var(--color-fg-subtle)] shrink-0">
                {timeAgo(e.occurredAt)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <>
      <Topbar title="Settings" />
      <main id="main" className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <Tabs defaultValue="profile">
            <TabsList className="mb-8">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="organization">Organization</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="flex flex-col gap-6">
              <Card className="p-6">
                <h3 className="font-serif text-xl tracking-tight">Your profile</h3>
                <p className="text-sm text-[color:var(--color-fg-muted)] mt-1 mb-6">
                  How you appear inside DocketLens.
                </p>
                <div className="grid md:grid-cols-2 gap-5">
                  <Field label="Display name">
                    <Input defaultValue="GG Yanie" />
                  </Field>
                  <Field label="Email">
                    <Input
                      type="email"
                      defaultValue="ggyanie.ai@gmail.com"
                      disabled
                    />
                  </Field>
                  <Field label="Time zone">
                    <Input defaultValue="America/Los_Angeles" />
                  </Field>
                  <Field label="Digest hour">
                    <Input type="number" defaultValue={7} min={0} max={23} />
                  </Field>
                </div>
                <Separator className="my-6" />
                <Field label="About">
                  <Textarea
                    defaultValue="Solo founder. Building data-driven SaaS in regulated markets."
                  />
                </Field>
                <div className="mt-6 flex justify-end">
                  <Button variant="accent">Save changes</Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="organization">
              <Card className="p-6">
                <h3 className="font-serif text-xl tracking-tight">Organization</h3>
                <p className="text-sm text-[color:var(--color-fg-muted)] mt-1 mb-6">
                  Shared watchlists, billing, and API keys live at the org level.
                </p>
                <div className="grid md:grid-cols-2 gap-5">
                  <Field label="Org name">
                    <Input defaultValue="DocketLens HQ" />
                  </Field>
                  <Field label="URL slug">
                    <Input defaultValue="docketlens-hq" />
                  </Field>
                </div>
                <Separator className="my-6" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Members</p>
                    <p className="text-xs text-[color:var(--color-fg-muted)] mt-0.5">
                      1 of 1 seats used (Free tier)
                    </p>
                  </div>
                  <Button variant="outline">Invite member</Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="billing">
              <Card className="p-6">
                <h3 className="font-serif text-xl tracking-tight">Plan & billing</h3>
                <div className="mt-6 flex items-center justify-between border border-[color:var(--color-border)] rounded-[var(--radius-md)] p-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-serif text-2xl">Free</p>
                      <Badge variant="default">Current plan</Badge>
                    </div>
                    <p className="text-sm text-[color:var(--color-fg-muted)] mt-1">
                      5 watchlists · 7-day history · daily digest
                    </p>
                  </div>
                  <Button variant="accent">Upgrade to Pro</Button>
                </div>
                <Separator className="my-6" />
                <p className="text-sm font-medium mb-3">Billing history</p>
                <p className="text-sm text-[color:var(--color-fg-muted)]">
                  No invoices yet.
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card className="p-6">
                <h3 className="font-serif text-xl tracking-tight">Notification preferences</h3>
                <div className="mt-6 flex flex-col gap-4">
                  {[
                    { label: "New watchlist matches", default: true },
                    { label: "Weekly summary email", default: true },
                    { label: "Failed alert deliveries", default: true },
                    { label: "Billing receipts", default: true },
                    { label: "Product updates", default: false },
                  ].map((n) => (
                    <label key={n.label} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={n.default}
                        className="size-4 rounded border-[color:var(--color-border-strong)] accent-[color:var(--color-accent)]"
                      />
                      <span className="text-sm">{n.label}</span>
                    </label>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="integrations" className="flex flex-col gap-6">
              <Card className="p-6">
                <h3 className="font-serif text-xl tracking-tight">Integrations</h3>
                <p className="text-sm text-[color:var(--color-fg-muted)] mt-1 mb-6">
                  Wire DocketLens into the tools your team already uses.
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { name: "Slack", desc: "Post matches to a channel", status: "Connected" },
                    { name: "Linear", desc: "Create issues from new filings", status: "Connect" },
                    { name: "Notion", desc: "Append matches to a database", status: "Connect" },
                    { name: "Webhook", desc: "Raw JSON to any URL", status: "Connected" },
                  ].map((i) => (
                    <div
                      key={i.name}
                      className="flex items-center justify-between rounded-[var(--radius-md)] border border-[color:var(--color-border)] p-4"
                    >
                      <div>
                        <p className="text-sm font-medium">{i.name}</p>
                        <p className="text-xs text-[color:var(--color-fg-muted)] mt-0.5">
                          {i.desc}
                        </p>
                      </div>
                      <Button
                        variant={i.status === "Connected" ? "outline" : "subtle"}
                        size="sm"
                      >
                        {i.status === "Connected" ? "Manage" : "Connect"}
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>

              <WebhookSigningCard />
            </TabsContent>

            <TabsContent value="security">
              <Card className="p-6">
                <h3 className="font-serif text-xl tracking-tight">Security</h3>
                <p className="text-sm text-[color:var(--color-fg-muted)] mt-1 mb-6">
                  Sessions, devices, and audit log.
                </p>
                <div className="space-y-3">
                  <Field label="Two-factor authentication">
                    <div className="flex items-center justify-between p-3 rounded-[var(--radius-md)] border border-[color:var(--color-border)]">
                      <p className="text-sm text-[color:var(--color-fg-muted)]">
                        Not configured
                      </p>
                      <Button variant="outline" size="sm">Set up 2FA</Button>
                    </div>
                  </Field>
                  <Field label="Active sessions">
                    <div className="flex items-center justify-between p-3 rounded-[var(--radius-md)] border border-[color:var(--color-border)]">
                      <div>
                        <p className="text-sm">macOS · Safari · San Francisco</p>
                        <p className="text-xs font-mono text-[color:var(--color-fg-subtle)] mt-0.5">
                          Current session · last active just now
                        </p>
                      </div>
                      <Badge variant="success">Current</Badge>
                    </div>
                  </Field>
                  <SettingsAuditPreview />
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-[color:var(--color-fg-muted)]">
        {label}
      </label>
      {children}
    </div>
  );
}
