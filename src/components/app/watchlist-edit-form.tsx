"use client";

import { useState } from "react";
import { Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const COURTS = [
  "S.D.N.Y.", "N.D. Cal.", "D. Del.", "E.D. Tex.", "D.D.C.", "C.D. Cal.", "N.D. Ill.",
];
const NOS = [
  { code: "830", label: "Patent" },
  { code: "840", label: "Trade Secret" },
  { code: "850", label: "Securities" },
  { code: "410", label: "Antitrust" },
  { code: "190", label: "Contract" },
];
const CADENCE = [
  { key: "realtime", label: "Real-time", note: "Pro · seconds" },
  { key: "hourly", label: "Hourly", note: "Pro" },
  { key: "daily", label: "Daily", note: "Free + Pro" },
] as const;

const ENTITY_TYPES = [
  { key: "party", label: "Party" },
  { key: "attorney", label: "Attorney" },
  { key: "judge", label: "Judge" },
  { key: "lawfirm", label: "Law firm" },
  { key: "case", label: "Case" },
  { key: "term", label: "Term search" },
] as const;

type EntityType = (typeof ENTITY_TYPES)[number]["key"];

interface Props {
  initialName: string;
  initialDescription: string;
  initialEntityType: EntityType;
  initialMatchValue: string;
}

export function WatchlistEditForm({
  initialName,
  initialDescription,
  initialEntityType,
  initialMatchValue,
}: Props) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [entityType, setEntityType] = useState<EntityType>(initialEntityType);
  const [matchValue, setMatchValue] = useState(initialMatchValue);
  const [courts, setCourts] = useState<string[]>([]);
  const [nos, setNos] = useState<string[]>([]);
  const [cadence, setCadence] = useState<"realtime" | "hourly" | "daily">(
    "daily"
  );

  const dirty =
    name !== initialName ||
    description !== initialDescription ||
    entityType !== initialEntityType ||
    matchValue !== initialMatchValue ||
    courts.length > 0 ||
    nos.length > 0 ||
    cadence !== "daily";

  const toggle = <T,>(arr: T[], v: T): T[] =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  function reset() {
    setName(initialName);
    setDescription(initialDescription);
    setEntityType(initialEntityType);
    setMatchValue(initialMatchValue);
    setCourts([]);
    setNos([]);
    setCadence("daily");
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Watchlist updated", {
      description: `Saved "${name}". Changes apply on the next refresh.`,
    });
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-8">
      <Card className="p-5 flex flex-col gap-5">
        <div>
          <h3 className="text-sm font-medium tracking-tight">Basics</h3>
          <p className="text-xs text-[color:var(--color-fg-muted)] mt-0.5">
            What this watchlist is and what it tracks.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Entity type">
            <div className="flex gap-1.5 flex-wrap">
              {ENTITY_TYPES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setEntityType(t.key)}
                  className={cn(
                    "text-xs rounded-full px-2.5 py-1 border transition-colors",
                    entityType === t.key
                      ? "bg-[color:var(--color-fg)] text-[color:var(--color-bg)] border-transparent"
                      : "border-[color:var(--color-border-strong)] text-[color:var(--color-fg-muted)] hover:border-[color:var(--color-fg)]"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </Field>
        </div>
        <Field label={`Match value${entityType ? ` (${entityType})` : ""}`}>
          <Input
            value={matchValue}
            onChange={(e) => setMatchValue(e.target.value)}
          />
        </Field>
        <Field label="Description">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
      </Card>

      <Card className="p-5 flex flex-col gap-5">
        <div>
          <h3 className="text-sm font-medium tracking-tight">Filters</h3>
          <p className="text-xs text-[color:var(--color-fg-muted)] mt-0.5">
            Optional — narrow which dockets count as matches.
          </p>
        </div>
        <Field label="Courts">
          <div className="flex flex-wrap gap-1.5">
            {COURTS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCourts((s) => toggle(s, c))}
                className={cn(
                  "text-xs font-mono rounded-full px-2.5 py-1 border transition-colors",
                  courts.includes(c)
                    ? "bg-[color:var(--color-fg)] text-[color:var(--color-bg)] border-transparent"
                    : "border-[color:var(--color-border-strong)] text-[color:var(--color-fg-muted)] hover:border-[color:var(--color-fg)]"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Nature of suit">
          <div className="flex flex-wrap gap-1.5">
            {NOS.map((n) => (
              <button
                key={n.code}
                type="button"
                onClick={() => setNos((s) => toggle(s, n.code))}
                className={cn(
                  "text-xs rounded-full px-2.5 py-1 border transition-colors",
                  nos.includes(n.code)
                    ? "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] border-transparent"
                    : "border-[color:var(--color-border-strong)] text-[color:var(--color-fg-muted)] hover:border-[color:var(--color-fg)]"
                )}
              >
                <span className="font-mono mr-1">{n.code}</span>
                {n.label}
              </button>
            ))}
          </div>
        </Field>
      </Card>

      <Card className="p-5 flex flex-col gap-5">
        <div>
          <h3 className="text-sm font-medium tracking-tight">Alert cadence</h3>
          <p className="text-xs text-[color:var(--color-fg-muted)] mt-0.5">
            How often do we look for new matches?
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {CADENCE.map((c) => {
            const active = cadence === c.key;
            const pro = c.key !== "daily";
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setCadence(c.key)}
                className={cn(
                  "text-left rounded-[var(--radius-md)] border p-4 transition-colors relative",
                  active
                    ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent-soft)]/40"
                    : "border-[color:var(--color-border)] hover:border-[color:var(--color-border-strong)] bg-[color:var(--color-bg-elevated)]"
                )}
              >
                {pro && (
                  <Badge variant="accent" className="absolute top-3 right-3">
                    PRO
                  </Badge>
                )}
                <p className="text-sm font-medium">{c.label}</p>
                <p className="text-xs text-[color:var(--color-fg-muted)] mt-1">
                  {c.note}
                </p>
              </button>
            );
          })}
        </div>
      </Card>

      <div className="flex justify-end gap-2 pt-2 border-t border-[color:var(--color-border)]">
        <Button
          type="button"
          variant="outline"
          onClick={reset}
          disabled={!dirty}
        >
          <RotateCcw className="size-4" />
          Reset
        </Button>
        <Button type="submit" variant="accent" disabled={!dirty || !name}>
          <Save className="size-4" />
          Save changes
        </Button>
      </div>
    </form>
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
