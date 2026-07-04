import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type MetricCardProps = React.HTMLAttributes<HTMLElement> & {
  label: ReactNode;
  value: ReactNode;
  detail?: ReactNode;
  meta?: ReactNode;
  compact?: boolean;
  labelClassName?: string;
  valueClassName?: string;
  detailClassName?: string;
};

export function MetricCard({
  label,
  value,
  detail,
  meta,
  compact = false,
  className,
  labelClassName,
  valueClassName,
  detailClassName,
  ...props
}: MetricCardProps) {
  return (
    <article
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden rounded-[1.5rem]",
        "border border-[color:var(--color-border)] bg-white",
        "shadow-[0_12px_40px_rgba(0,32,80,0.05)]",
        compact ? "p-4" : "p-5 sm:p-6",
        className,
      )}
      {...props}
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <p
          className={cn(
            "min-w-0 flex-1 text-[0.72rem] font-semibold uppercase tracking-[0.2em]",
            "leading-5 break-words text-[color:var(--color-text-muted)] sm:text-xs",
            labelClassName,
          )}
        >
          {label}
        </p>
        {meta ? <div className="shrink-0">{meta}</div> : null}
      </div>

      <div
        className={cn(
          "mt-3 min-w-0 whitespace-nowrap break-normal font-semibold tracking-tight text-[color:var(--color-primary-dark)]",
          "text-[clamp(1.5rem,3.4vw,2.625rem)] leading-none tabular-nums",
          compact && "text-[clamp(1.15rem,2.5vw,1.875rem)]",
          valueClassName,
        )}
      >
        {value}
      </div>

      {detail ? (
        <p
          className={cn(
            "mt-3 min-w-0 break-words text-sm leading-6 text-[color:var(--color-text-muted)]",
            compact && "mt-2 text-xs leading-5",
            detailClassName,
          )}
        >
          {detail}
        </p>
      ) : null}
    </article>
  );
}

export function MetricGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid items-stretch gap-4 [grid-template-columns:repeat(auto-fit,minmax(12rem,1fr))]", className)}>
      {children}
    </div>
  );
}
