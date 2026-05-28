"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { FileText, Gavel, Scale, Building2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

/* ============================================================================
 *  Live docket stream (hero)
 *
 *  Renders a 3-item carousel that cycles every 4.2s. Source of entries:
 *    1. `entries` prop, if provided + non-empty → real cached filings
 *       from the database. The disclaimer text reads "Recent federal
 *       filings · cached via CourtListener".
 *    2. Otherwise → hardcoded FAUX entries that demo the look. The
 *       disclaimer reads "Sample stream · not real cases" so the page
 *       never lies about its data source.
 *
 *  Earlier bug history: keyed off `e.id + cursor` so every tick remounted
 *  all three rows + animated height 0→auto, causing the card to pulse and
 *  the browser's overflow-anchor to scroll the page. Fixed by giving each
 *  entering row a unique renderKey + dropping the height animation; the
 *  unchanged rows now stay completely still.
 * ==========================================================================*/

type Variant = "accent" | "info" | "warning" | "danger" | "success";

export type StreamEntry = {
  id: string;
  court: string;
  caseNo: string;
  case: string;
  filed: string;
  type: "Complaint" | "Motion" | "Order" | "Notice" | "Verdict" | "Brief" | "Stipulation";
  summary: string;
  tag?: { variant: Variant; label: string };
};

type RenderedEntry = StreamEntry & { renderKey: string };

// Map entry type → icon. Keeps the prop shape JSON-friendly so the server
// can hand us real entries from the DB without sending function refs.
const ICON_BY_TYPE: Record<StreamEntry["type"], typeof FileText> = {
  Complaint: FileText,
  Motion: Gavel,
  Order: Scale,
  Notice: AlertTriangle,
  Verdict: Scale,
  Brief: Building2,
  Stipulation: FileText,
};

const FAUX: StreamEntry[] = [
  {
    id: "1",
    court: "S.D.N.Y.",
    caseNo: "1:25-cv-04812",
    case: "Helios Bio Inc. v. Northgate Labs",
    filed: "13s ago",
    type: "Complaint",
    summary:
      "Trade-secret suit over a fluorescent reporter chemistry — Helios alleges three former scientists carried protocols to Northgate. $42M in claimed damages.",
    tag: { variant: "accent", label: "Patent / Trade Secret" },
  },
  {
    id: "2",
    court: "N.D. Cal.",
    caseNo: "3:25-cv-01984",
    case: "FTC v. Aurora AI Corp.",
    filed: "47s ago",
    type: "Motion",
    summary:
      "FTC moves for a preliminary injunction blocking Aurora's planned acquisition of training-data vendor Vellum. Hearing set for next Thursday.",
    tag: { variant: "warning", label: "Antitrust" },
  },
  {
    id: "3",
    court: "D. Del.",
    caseNo: "1:25-cv-00713",
    case: "Optera Semiconductor v. ARM Holdings",
    filed: "1m ago",
    type: "Order",
    summary:
      "Judge Stark denies ARM's motion to dismiss; the §271(a) infringement claims survive. Discovery cutoff extended 60 days.",
    tag: { variant: "info", label: "Patent" },
  },
  {
    id: "4",
    court: "S.D.N.Y.",
    caseNo: "1:25-cv-04901",
    case: "Larsen v. Crestmark Capital LLC",
    filed: "2m ago",
    type: "Complaint",
    summary:
      "Putative securities class action — plaintiffs allege Crestmark inflated Q4 AUM disclosures by 18%. Lead plaintiff motion deadline in 60 days.",
    tag: { variant: "danger", label: "Securities" },
  },
  {
    id: "5",
    court: "E.D. Tex.",
    caseNo: "2:25-cv-00382",
    case: "In re Quantix LiDAR Patent Litigation",
    filed: "3m ago",
    type: "Notice",
    summary:
      "Defendants Tesla, Waymo, and Cruise consolidated into MDL. Joint case-management report due 30 days post-transfer.",
    tag: { variant: "accent", label: "MDL" },
  },
];

export function LiveDocketStream({
  entries,
}: {
  entries?: StreamEntry[];
}) {
  const live = entries && entries.length >= 3 ? entries : FAUX;
  const isReal = entries !== undefined && entries.length >= 3;

  const keyRef = useRef(2);
  const [visible, setVisible] = useState<RenderedEntry[]>(() =>
    live.slice(0, 3).map((e, i) => ({ ...e, renderKey: `${e.id}-${i}` }))
  );
  const [cursor, setCursor] = useState(3 % live.length);

  useEffect(() => {
    const t = setInterval(() => {
      setCursor((c) => {
        const next = (c + 1) % live.length;
        keyRef.current += 1;
        const incoming: RenderedEntry = {
          ...live[next],
          renderKey: `${live[next].id}-${keyRef.current}`,
        };
        setVisible((v) => [incoming, ...v.slice(0, 2)]);
        return next;
      });
    }, 4200);
    return () => clearInterval(t);
  }, [live]);

  return (
    <Card
      className="relative overflow-hidden shadow-soft bg-[color:var(--color-bg-elevated)] min-h-[420px]"
      style={{ overflowAnchor: "none" }}
    >
      <div className="flex items-center justify-between border-b border-[color:var(--color-border)] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="relative inline-flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--color-success)] opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-[color:var(--color-success)]" />
          </span>
          <span className="eyebrow">Live · Federal courts</span>
        </div>
        <span className="text-xs font-mono text-[color:var(--color-fg-subtle)]">
          PACER → RECAP → DocketLens
        </span>
      </div>

      <div className="flex flex-col">
        <AnimatePresence initial={false}>
          {visible.map((e) => {
            const Icon = ICON_BY_TYPE[e.type] ?? FileText;
            return (
              <motion.div
                key={e.renderKey}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="border-b border-[color:var(--color-border)] last:border-b-0"
              >
                <div className="flex gap-3 px-4 py-4">
                  <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-bg-subtle)] border border-[color:var(--color-border)]">
                    <Icon className="size-4 text-[color:var(--color-fg-muted)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[11px] text-[color:var(--color-fg-subtle)] tabular">
                        {e.court} · {e.caseNo}
                      </span>
                      {e.tag && <Badge variant={e.tag.variant}>{e.tag.label}</Badge>}
                      <span className="ml-auto font-mono text-[11px] text-[color:var(--color-fg-subtle)]">
                        {e.filed}
                      </span>
                    </div>
                    <p className="text-[13px] font-medium leading-snug truncate">
                      {e.case}
                    </p>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-[color:var(--color-fg-muted)]">
                      <span className="text-[color:var(--color-accent)] font-medium">
                        {e.type}.
                      </span>{" "}
                      {e.summary}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="border-t border-[color:var(--color-border)] px-4 py-2.5 bg-[color:var(--color-bg-subtle)]">
        <p className="text-[11px] text-[color:var(--color-fg-subtle)] font-mono">
          {isReal
            ? "Recent federal filings · cached via CourtListener · refreshes every 4s"
            : "Sample stream · not real cases · refreshes every 4s"}
        </p>
      </div>
    </Card>
  );
}
