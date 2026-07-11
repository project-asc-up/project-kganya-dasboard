import assert from "node:assert/strict";
import test from "node:test";

import type { MutationError, MutationResult } from "@/lib/mutation-types";

test("mutation result contract represents a saved mutation awaiting sync", () => {
  const result: MutationResult = {
    mutationId: "mut-1",
    requestId: "req-1",
    kind: "create",
    recordId: "faq-1",
    persistence: "saved",
    sync: { status: "pending", jobId: "job-1" },
  };

  assert.equal(result.persistence, "saved");
  assert.equal(result.sync.status, "pending");
});

test("mutation errors are serializable and can be retried", () => {
  const error: MutationError = {
    code: "SYNC_FAILED",
    message: "Chatbot update failed",
    retryable: true,
  };

  assert.deepEqual(JSON.parse(JSON.stringify(error)), error);
});
