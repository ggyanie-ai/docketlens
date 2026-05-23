import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCompactNumber(n: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

const RTF = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["week", 60 * 60 * 24 * 7],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
];

export function timeAgo(date: Date | string | number) {
  const d = typeof date === "object" ? date : new Date(date);
  const diff = (d.getTime() - Date.now()) / 1000;
  const abs = Math.abs(diff);
  for (const [unit, sec] of UNITS) {
    if (abs >= sec || unit === "minute") {
      return RTF.format(Math.round(diff / sec), unit);
    }
  }
  return RTF.format(0, "minute");
}

export function formatCaseNumber(num: string | null | undefined) {
  if (!num) return "—";
  return num.replace(/\s+/g, " ").trim();
}

export function truncate(s: string, n = 140) {
  return s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
