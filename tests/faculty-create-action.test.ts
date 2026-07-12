import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

test("createFaculty uses receipt transaction, code upsert and sync result", () => {
  const source = readFileSync("src/lib/admin-actions.ts", "utf8");
  const body = source.slice(source.indexOf("export async function createFaculty"), source.indexOf("export async function updateFaculty"));
  assert.match(body, /executeMutationWithReceipt/);
  assert.match(body, /where: \{ code: data\.code \}/);
  assert.match(body, /enqueueDifySyncJob/);
  assert.match(body, /satisfies|return \{ mutationId/);
  assert.doesNotMatch(body, /redirect\s*\(/);
});
