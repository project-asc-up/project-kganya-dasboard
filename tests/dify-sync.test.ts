import assert from "node:assert/strict";
import test from "node:test";

import { buildDifySyncDedupeKey } from "@/lib/dify-sync";

test("Dify sync dedupe keys are stable for the same source/action", () => {
  const input = { sourceTable: "faqs", sourceId: "faq-1", action: "update" as const, contentKind: "text" as const };
  assert.equal(buildDifySyncDedupeKey(input), "faqs:faq-1:update:text");
  assert.equal(buildDifySyncDedupeKey({ ...input }), buildDifySyncDedupeKey(input));
});

test("Dify sync dedupe keys distinguish jobs that must not converge", () => {
  const base = { sourceTable: "faqs", sourceId: "faq-1", action: "update" as const, contentKind: "text" as const };
  assert.notEqual(buildDifySyncDedupeKey(base), buildDifySyncDedupeKey({ ...base, action: "delete" }));
  assert.notEqual(buildDifySyncDedupeKey(base), buildDifySyncDedupeKey({ ...base, contentKind: "file" }));
});
