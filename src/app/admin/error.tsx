"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="rounded-[1.75rem] border border-[color:var(--color-border)] bg-white p-8 shadow-[0_12px_40px_rgba(0,32,80,0.05)]">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--color-accent-red)]">
        Something went wrong
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[color:var(--color-primary-dark)]">
        The admin page could not load.
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--color-text-muted)]">
        Try refreshing the page. If the problem persists, check the database connection and the browser
        console for the underlying error.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex rounded-full bg-[color:var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--color-hover)]"
      >
        Retry
      </button>
    </div>
  );
}
