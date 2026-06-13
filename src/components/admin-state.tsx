import Link from "next/link";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-bg-light)] px-6 py-10 text-center">
      <h3 className="text-xl font-semibold tracking-tight text-[color:var(--color-primary-dark)]">{title}</h3>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[color:var(--color-text-muted)]">
        {description}
      </p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-6 inline-flex rounded-full bg-[color:var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--color-hover)]"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="space-y-4">
      <div className="h-8 w-56 animate-pulse rounded-full bg-[color:var(--color-bg-light)]" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-[1.5rem] border border-[color:var(--color-border)] bg-[color:var(--color-bg-light)]"
            aria-hidden="true"
          />
        ))}
      </div>
      <p className="text-sm text-[color:var(--color-text-muted)]">{label}...</p>
    </div>
  );
}
