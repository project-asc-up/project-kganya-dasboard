import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

test("createFaq returns its structured result without redirecting", () => {
  const source = readFileSync("src/lib/admin-actions.ts", "utf8");
  const body = source.slice(source.indexOf("export async function createFaq"), source.indexOf("export async function updateFaq"));
  assert.doesNotMatch(body, /redirect\s*\(/);
  assert.doesNotMatch(body, /previousReceipt/);
  assert.match(body, /satisfies MutationResult/);
});
