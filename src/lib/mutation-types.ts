export type MutationKind = "create" | "update" | "delete" | "invite" | "access";

export type MutationPhase =
  | "idle"
  | "submitting"
  | "saved"
  | "syncing"
  | "complete"
  | "error";

export type MutationError = {
  code: string;
  message: string;
  retryable: boolean;
};

export type MutationSync =
  | { status: "not_applicable"; jobId: null }
  | { status: "pending" | "failed"; jobId: string }
  | { status: "synced"; jobId: string };

export type MutationResult<TData = unknown> = {
  mutationId: string;
  requestId: string;
  kind: MutationKind;
  recordId: string | null;
  persistence: "saved" | "failed";
  sync: MutationSync;
  data?: TData;
  error?: MutationError;
};
