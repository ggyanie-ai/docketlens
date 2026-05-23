import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils";

export function Avatar({
  name,
  image,
  size = 32,
  className,
}: {
  name?: string | null;
  image?: string | null;
  size?: number;
  className?: string;
}) {
  const init = initials(name ?? "");
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-subtle)] text-[color:var(--color-fg-muted)] font-medium overflow-hidden select-none",
        className
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.4),
      }}
      aria-hidden
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          width={size}
          height={size}
          className="h-full w-full object-cover"
        />
      ) : (
        init || "?"
      )}
    </span>
  );
}
