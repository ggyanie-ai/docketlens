import { cn } from "@/lib/utils";

export function Logo({ className, size = 22 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
      aria-hidden
    >
      <defs>
        <linearGradient id="dl-g" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="oklch(78% 0.165 70)" />
          <stop offset="1" stopColor="oklch(58% 0.140 55)" />
        </linearGradient>
      </defs>
      {/* spine */}
      <rect x="4" y="5" width="3" height="22" rx="1" fill="url(#dl-g)" />
      {/* docket pages */}
      <rect x="9" y="7" width="19" height="3" rx="1" className="fill-[color:var(--color-fg)]/85" />
      <rect x="9" y="12" width="15" height="3" rx="1" className="fill-[color:var(--color-fg)]/65" />
      <rect x="9" y="17" width="17" height="3" rx="1" className="fill-[color:var(--color-fg)]/45" />
      <rect x="9" y="22" width="11" height="3" rx="1" className="fill-[color:var(--color-fg)]/30" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 select-none", className)}>
      <Logo />
      <span className="dl-word font-serif text-[18px] tracking-tight leading-none">
        Docket<span className="text-[color:var(--color-accent)]">Lens</span>
      </span>
    </span>
  );
}
