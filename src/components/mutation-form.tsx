"use client";

import { useCallback, useRef, useState, type FormEvent, type ReactNode } from "react";
import { MutationFeedbackModal } from "@/components/mutation-feedback-modal";
import type { MutationPhase, MutationResult } from "@/lib/mutation-types";

export type MutationAction = (formData: FormData) => Promise<MutationResult>;

export function MutationForm({ action, children, className }: { action: MutationAction; children: ReactNode; className?: string }) {
  const [phase, setPhase] = useState<MutationPhase>("idle");
  const [result, setResult] = useState<MutationResult>();
  const [error, setError] = useState<string>();
  const requestId = useRef<string | undefined>(undefined);
  const submitting = phase === "submitting" || phase === "saved" || phase === "syncing";

  const submit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    requestId.current = crypto.randomUUID();
    setError(undefined);
    setPhase("submitting");
    try {
      const formData = new FormData(event.currentTarget);
      formData.set("requestId", requestId.current);
      const saved = await action(formData);
      setResult(saved);
      setPhase("saved");
      if (saved.sync.status === "not_applicable" || saved.sync.status === "synced") {
        setPhase("complete");
        return;
      }
      setPhase("syncing");
      for (let attempt = 0; attempt < 120; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const response = await fetch(`/api/admin/mutations/${saved.mutationId}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Unable to check chatbot update status.");
        const current = (await response.json()) as { sync?: { status?: string; error?: string | null } };
        if (current.sync?.status === "synced") { setPhase("complete"); return; }
        if (current.sync?.status === "failed") throw new Error(current.sync.error ?? "Live chatbot update failed.");
      }
      throw new Error("Live chatbot update is taking longer than expected.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save changes.");
      setPhase("error");
    }
  }, [action, submitting]);

  const retry = () => { setPhase("idle"); setError(undefined); };
  return <>
    <form className={className} onSubmit={submit} aria-busy={submitting}>{children}</form>
    <MutationFeedbackModal open={phase !== "idle"} phase={phase} result={result} error={error} onDone={() => setPhase("idle")} onRetry={retry} />
  </>;
}
