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

test("faculty update and delete use receipts, sync, and no redirects", () => {
  const source = readFileSync("src/lib/admin-actions.ts", "utf8");
  for (const name of ["updateFaculty", "deleteFaculty"]) {
    const start = source.indexOf(`export async function ${name}`);
    const end = source.indexOf("export async function", start + 10);
    const body = source.slice(start, end < 0 ? undefined : end);
    assert.match(body, /executeMutationWithReceipt/);
    assert.match(body, /enqueueDifySyncJob/);
    assert.doesNotMatch(body, /redirect\s*\(/);
  }
});
