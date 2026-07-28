"use client";

import { useCallback, useRef, useState, type FormEvent, type ReactNode } from "react";
import { MutationFeedbackModal } from "@/components/mutation-feedback-modal";
import type { MutationPhase, MutationResult } from "@/lib/mutation-types";

export type MutationAction = (formData: FormData) => Promise<MutationResult>;

export function MutationForm({
  action,
  children,
  className,
  onComplete,
  validate,
  onSuccess,
}: {
  action: MutationAction;
  children: ReactNode;
  className?: string;
  onComplete?: () => void;
  validate?: (formData: FormData) => string | null;
  onSuccess?: () => void;
}) {
  const [phase, setPhase] = useState<MutationPhase>("idle");
  const [result, setResult] = useState<MutationResult>();
  const [error, setError] = useState<string>();
  const requestId = useRef<string | undefined>(undefined);
  const submittingRef = useRef(false);
  const submitting = phase === "submitting" || phase === "saved" || phase === "syncing";

  const submit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current || submitting) return;
    const formElement = event.currentTarget;
    submittingRef.current = true;
    requestId.current = crypto.randomUUID();
    setError(undefined);
    setPhase("submitting");
    try {
      const formData = new FormData(formElement);
      formData.set("requestId", requestId.current);
      
      if (validate) {
        const validationError = validate(formData);
        if (validationError) {
          setError(validationError);
          setPhase("error");
          submittingRef.current = false;
          return;
        }
      }

      const saved = await action(formData);
      setResult(saved);
      if (saved.sync.status === "failed") {
        setError("Saved, but chatbot update failed: " + (saved.sync.jobId || "Dify error"));
        setPhase("error");
      } else {
        setPhase("complete");
        formElement.reset();
        onSuccess?.();
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save changes.");
      setPhase("error");
    } finally {
      submittingRef.current = false;
    }
  }, [action, submitting, validate, onSuccess]);

  const retry = async () => {
    // Retry is no longer needed since actions are inline and immediate.
    // We keep the signature/stub so the typecheck passes if anything references it.
  };

  return <>
    <form className={className} onSubmit={submit} aria-busy={submitting}>{children}</form>
    <MutationFeedbackModal open={phase !== "idle"} phase={phase} result={result} error={error} onDone={() => { setPhase("idle"); onComplete?.(); }} onRetry={retry} />
  </>;
}
