"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ChevronDown, Eye, Beaker, RotateCcw, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import {
  Dropdown,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
} from "@/components/ui/dropdown";
import { Badge } from "@/components/ui/badge";

/* ============================================================================
 *  DashboardDemoTag
 *
 *  Small pill in the dashboard top section that flags the data as demo
 *  (since auth/DB aren't wired live yet) and lets a viewer jump between
 *  related views:
 *
 *    • Empty-org preview      → /dashboard?empty=1
 *    • Public guest tour      → /demo
 *    • Reset onboarding state → clear localStorage flags + reload
 *
 *  Replaces nothing else; sits above the OnboardingChecklist.
 * ==========================================================================*/

const ONBOARDING_KEYS = ["dl-onboarding-steps", "dl-onboarding-dismissed"];

export function DashboardDemoTag() {
  const router = useRouter();

  function resetOnboarding() {
    try {
      for (const k of ONBOARDING_KEYS) window.localStorage.removeItem(k);
    } catch {
      // ignore
    }
    toast.success("Onboarding reset", {
      description: "Refreshing the dashboard so the checklist comes back.",
    });
    router.refresh();
  }

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <Dropdown
        align="start"
        trigger={
          <button
            type="button"
            aria-label="Demo data options"
            className="inline-flex items-center gap-2 h-8 rounded-full border border-[color:var(--color-accent)]/40 bg-[color:var(--color-accent-soft)]/40 px-3 text-xs text-[color:var(--color-fg)] hover:bg-[color:var(--color-accent-soft)]/60 transition-colors ring-focus"
          >
            <Beaker className="size-3.5 text-[color:var(--color-accent)]" />
            <span className="font-medium">Demo data</span>
            <Badge variant="outline" className="text-[9px] py-0">
              local
            </Badge>
            <ChevronDown className="size-3 text-[color:var(--color-fg-muted)]" />
          </button>
        }
      >
        <DropdownLabel>Views</DropdownLabel>
        <DropdownItem onClick={() => router.push("/dashboard?empty=1")}>
          <Eye className="size-3.5" />
          Empty-org preview
        </DropdownItem>
        <DropdownItem onClick={() => router.push("/demo")}>
          <ExternalLink className="size-3.5" />
          Public guest tour
        </DropdownItem>
        <DropdownSeparator />
        <DropdownLabel>Local state</DropdownLabel>
        <DropdownItem onClick={resetOnboarding}>
          <RotateCcw className="size-3.5" />
          Reset onboarding checklist
        </DropdownItem>
      </Dropdown>

      <Link
        href={"/docs/api" as never}
        className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-[color:var(--color-fg-subtle)] hover:text-[color:var(--color-fg)] transition-colors"
      >
        <Sparkles className="size-3 text-[color:var(--color-accent)]" />
        Until Tuesday this is all sample data — schema + UI are wired,
        DB swap is a marshalling step
      </Link>
    </div>
  );
}
