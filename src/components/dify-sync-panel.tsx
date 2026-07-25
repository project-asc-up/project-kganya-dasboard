"use client";

import { useState } from "react";
import { RefreshCw, CheckCircle2, AlertTriangle, Layers, Users, BookMarked, Link as LinkIcon, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type SyncedCounts = {
  faculties: number;
  coaches: number;
  programmes: number;
  resources: number;
  faqs: number;
};

type SyncResult = {
  ok: boolean;
  reconciledDifyDocsCount?: number;
  reconciliationFailed?: boolean;
  reconciliationError?: string;
  backfilled?: SyncedCounts;
  error?: string;
};

export function DifySyncPanel({ difyConfigured }: { difyConfigured: boolean }) {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setResult(null);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/admin/dify-sync/backfill", {
        method: "POST",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `Server error ${response.status}`);
      }

      setResult(data);
    } catch (err) {
      console.error("Dify backfill failed:", err);
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setSyncing(false);
    }
  };

  if (!difyConfigured) {
    return (
      <div className="rounded-[1.5rem] border border-[color:var(--color-danger)]/20 bg-[color:var(--color-danger-soft)] p-6 shadow-[var(--shadow-card)] animate-slide-up">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-danger)]/10 text-[color:var(--color-danger)]">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[color:var(--color-danger-foreground)]">
              Dify Knowledge Base API is not configured
            </h3>
            <p className="mt-2 text-sm leading-6 text-[color:var(--color-danger-foreground)]/80">
              To enable database-to-Dify synchronization, please configure the required environment variables in your active <code>.env</code> file:
            </p>
            <ul className="mt-3 space-y-1.5 text-xs font-mono bg-white/40 rounded-xl p-3 border border-[color:var(--color-danger)]/10 text-[color:var(--color-danger-foreground)]">
              <li>DIFY_KB_API_KEY=your_dataset_api_key</li>
              <li>DIFY_DATASET_ID=your_dify_dataset_id</li>
              <li>DIFY_API_BASE=https://api.dify.ai/v1 (optional)</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const counts = result?.backfilled;
  const showStats = result && result.ok && counts;

  return (
    <div className="space-y-6">
      <div className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-6 shadow-[0_12px_40px_rgba(0,32,80,0.04)] hover-lift animate-slide-up">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-[color:var(--color-primary-dark)] flex items-center gap-2">
              Dify Knowledge Base Sync
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
                Connected
              </span>
            </h3>
            <p className="text-sm text-[color:var(--color-text-muted)] leading-relaxed max-w-2xl">
              Sync and index academic resource records directly into your Dify dataset. Each database row is processed as its own document, augmented with structural metadata headers to prevent reference loss for AI agents.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Button
              type="button"
              variant="primary"
              rounded="full"
              size="lg"
              disabled={syncing}
              loading={syncing}
              loadingText="Syncing Database..."
              onClick={handleSync}
              className="w-full md:w-auto shadow-sm"
            >
              {!syncing && <RefreshCw className="h-4 w-4 mr-2" />}
              Sync Database Contents
            </Button>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-6 rounded-2xl border border-[color:var(--color-danger)]/30 bg-[color:var(--color-danger-soft)] p-4 text-sm text-[color:var(--color-danger-foreground)] animate-slide-up flex gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-[color:var(--color-danger)]" />
            <div>
              <p className="font-semibold">Sync failed</p>
              <p className="mt-1 text-xs opacity-90 font-mono break-all">{errorMsg}</p>
            </div>
          </div>
        )}

        {result && !result.ok && result.error && (
          <div className="mt-6 rounded-2xl border border-[color:var(--color-danger)]/30 bg-[color:var(--color-danger-soft)] p-4 text-sm text-[color:var(--color-danger-foreground)] animate-slide-up flex gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-[color:var(--color-danger)]" />
            <div>
              <p className="font-semibold">Sync failed</p>
              <p className="mt-1 text-xs opacity-90 font-mono break-all">{result.error}</p>
            </div>
          </div>
        )}

        {result && result.ok && (
          <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-50 p-4 text-sm text-emerald-800 animate-slide-up flex gap-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <p className="font-semibold">Sync complete</p>
              <p className="mt-0.5 text-xs opacity-95">
                Successfully reconciled {result.reconciledDifyDocsCount ?? 0} existing Dify documents.
                {result.reconciliationFailed && (
                  <span className="block mt-1 text-amber-700 italic">
                    Note: Dify API connection failed during initial reconciliation ({result.reconciliationError}). New documents were created without matching.
                  </span>
                )}
              </p>
            </div>
          </div>
        )}
      </div>

      {showStats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 animate-slide-up">
          {[
            { label: "Faculties", count: counts.faculties, icon: <Layers className="h-5 w-5" /> },
            { label: "Coaches", count: counts.coaches, icon: <Users className="h-5 w-5" /> },
            { label: "Programmes", count: counts.programmes, icon: <BookMarked className="h-5 w-5" /> },
            { label: "Resources", count: counts.resources, icon: <LinkIcon className="h-5 w-5" /> },
            { label: "FAQs", count: counts.faqs, icon: <HelpCircle className="h-5 w-5" /> },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-[color:var(--color-border)] bg-white p-5 shadow-[0_4px_20px_rgba(0,32,80,0.02)] transition-all hover:shadow-[0_8px_30px_rgba(0,32,80,0.04)]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand)]">
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[color:var(--color-text-muted)] uppercase tracking-wider">
                    {item.label}
                  </p>
                  <p className="mt-1 text-2xl font-bold tracking-tight text-[color:var(--color-primary-dark)]">
                    {item.count}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-[11px] text-[color:var(--color-text-muted)]">
                New documents synced to dataset.
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
