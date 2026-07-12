"use client";

import { CheckCircle2, Loader2, RefreshCw, XCircle } from "lucide-react";
import type { MutationError, MutationPhase, MutationResult } from "@/lib/mutation-types";
import { Button } from "@/components/ui/button";

export type MutationFeedbackModalProps = {
  open: boolean;
  phase: MutationPhase;
  result?: MutationResult;
  error?: MutationError | string;
  onDone: () => void;
  onRetry?: () => void;
  title?: string;
};

export function MutationFeedbackModal({ open, phase, result, error, onDone, onRetry, title = "Saving changes" }: MutationFeedbackModalProps) {
  if (!open) return null;
  const message = typeof error === "string" ? error : error?.message;
  const isBusy = phase === "submitting" || phase === "saved" || phase === "syncing";
  const isError = phase === "error";
  const isComplete = phase === "complete";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm" role="presentation">
      <div className="w-full max-w-md rounded-2xl border border-[color:var(--color-border)] bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="mutation-feedback-title" aria-live="polite">
        <h2 id="mutation-feedback-title" className="text-lg font-semibold text-[color:var(--color-primary-dark)]">{title}</h2>
        <div className="mt-5 flex items-start gap-3">
          {isBusy && <Loader2 className="mt-0.5 animate-spin text-[color:var(--color-primary)]" aria-hidden="true" />}
          {isComplete && <CheckCircle2 className="mt-0.5 text-emerald-600" aria-hidden="true" />}
          {isError && <XCircle className="mt-0.5 text-red-600" aria-hidden="true" />}
          <p className="text-sm text-[color:var(--color-text-muted)]">
            {phase === "submitting" && "Saving your changes..."}
            {phase === "saved" && "Saved. Preparing the live chatbot update..."}
            {phase === "syncing" && "Updating the live chatbot..."}
            {isComplete && "Live chatbot updated"}
            {isError && (message ?? "We could not complete this change.")}
          </p>
        </div>
        {result?.recordId && <p className="mt-3 text-xs text-[color:var(--color-text-muted)]">Record: {result.recordId}</p>}
        <div className="mt-6 flex justify-end gap-3">
          {isError && onRetry && <Button variant="secondary" onClick={onRetry}><RefreshCw size={16} /> Try again</Button>}
          {(isComplete || isError) && <Button variant="primary" onClick={onDone}>{isComplete ? "Done" : "Close"}</Button>}
        </div>
      </div>
    </div>
  );
}
