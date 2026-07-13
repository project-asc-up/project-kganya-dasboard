import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

import { buildDifySyncDedupeKey, resolveDifySyncReuseAction } from "@/lib/dify-sync";

test("Dify sync dedupe keys are stable for the same source/action", () => {
  const input = { sourceTable: "faqs", sourceId: "faq-1", action: "update" as const, contentKind: "text" as const };
  assert.equal(buildDifySyncDedupeKey(input), "faqs:faq-1:update:text:");
  assert.notEqual(buildDifySyncDedupeKey({ ...input, inputChecksum: "a" }), buildDifySyncDedupeKey({ ...input, inputChecksum: "b" }));
  assert.equal(buildDifySyncDedupeKey({ ...input }), buildDifySyncDedupeKey(input));
});

test("Dify sync dedupe keys distinguish jobs that must not converge", () => {
  const base = { sourceTable: "faqs", sourceId: "faq-1", action: "update" as const, contentKind: "text" as const };
  assert.notEqual(buildDifySyncDedupeKey(base), buildDifySyncDedupeKey({ ...base, action: "delete" }));
  assert.notEqual(buildDifySyncDedupeKey(base), buildDifySyncDedupeKey({ ...base, contentKind: "file" }));
});

test("database schema has a unique dedupe backstop", () => {
  const schema = readFileSync("prisma/schema.prisma", "utf8");
  const migration = readFileSync("prisma/migrations/0008_dify_sync_dedupe_key/migration.sql", "utf8");
  assert.match(schema, /dedupeKey\s+String\?\s+@unique/);
  assert.match(migration, /CREATE UNIQUE INDEX .*dedupe_key_key/);
});

test("sync jobs reuse completed work and refresh terminal failures", () => {
  assert.equal(resolveDifySyncReuseAction("completed"), "reuse");
  assert.equal(resolveDifySyncReuseAction("processing"), "reuse");
  assert.equal(resolveDifySyncReuseAction("failed"), "refresh");
  assert.equal(resolveDifySyncReuseAction("unknown"), "create");
});
