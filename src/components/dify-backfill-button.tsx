"use client";

import { useState } from "react";

type BackfillJob = {
  id: string;
  status: string;
  attemptCount: number;
  lastError: string | null;
};

type BackfillResult = {
  ok: boolean;
  totalResources?: number;
  queued?: number;
  processed?: number;
  jobs?: BackfillJob[];
  error?: Record<string, unknown>;
};

export function DifyBackfillButton() {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<BackfillResult | null>(null);

  async function handleBackfill() {
    setState("loading");
    setResult(null);

    try {
      const res = await fetch("/api/admin/dify-sync/backfill", { method: "POST" });
      const data: BackfillResult = await res.json();
      setResult(data);
      setState(data.ok ? "done" : "error");
    } catch (err) {
      setResult({ ok: false, error: { message: String(err) } });
      setState("error");
    }
  }

  const successCount = result?.jobs?.filter((j) => j.status === "synced").length ?? 0;
  const failCount = result?.jobs?.filter((j) => j.status === "failed").length ?? 0;

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-6 shadow-[var(--shadow-card)]">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
        Knowledge sync
      </p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--color-text)]">
        Dify backfill
      </h2>
      <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
        Push all existing resources to the self-hosted Dify knowledge base. Safe to re-run — already-synced records are skipped.
      </p>

      <button
        id="dify-backfill-btn"
        onClick={handleBackfill}
        disabled={state === "loading"}
        className="mt-4 inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2"
      >
        {state === "loading" ? (
          <>
            <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Running backfill…
          </>
        ) : (
          "Run backfill"
        )}
      </button>

      {state === "done" && result?.ok && (
        <div className="mt-4 rounded-[var(--radius-md)] border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm">
          <p className="font-medium text-green-700 dark:text-green-400">Backfill complete</p>
          <ul className="mt-1 space-y-0.5 text-xs text-green-700/80 dark:text-green-400/80">
            <li>Total resources: {result.totalResources}</li>
            <li>Jobs queued: {result.queued}</li>
            <li>Jobs processed: {result.processed}</li>
            <li>Synced: {successCount} · Failed: {failCount}</li>
          </ul>
          {failCount > 0 && (
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
              {failCount} job(s) failed — check Dify API config and re-run.
            </p>
          )}
        </div>
      )}

      {state === "error" && (
        <div className="mt-4 rounded-[var(--radius-md)] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm">
          <p className="font-medium text-red-700 dark:text-red-400">Backfill failed</p>
          <p className="mt-1 text-xs text-red-700/80 dark:text-red-400/80">
            {String(result?.error?.message ?? "Unknown error")}
          </p>
        </div>
      )}
    </div>
  );
}
