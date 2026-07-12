import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

test("mutation feedback modal has centered blurred lifecycle states", () => {
  const source = readFileSync("src/components/mutation-feedback-modal.tsx", "utf8");
  assert.match(source, /backdrop-blur/);
  assert.match(source, /items-center justify-center/);
  assert.match(source, /Live chatbot updated/);
  assert.match(source, /Done/);
  assert.match(source, /animate-spin/);
});

test("mutation form disables duplicate submits and polls sync", () => {
  const source = readFileSync("src/components/mutation-form.tsx", "utf8");
  assert.match(source, /submittingRef\.current/);
  assert.match(source, /crypto.randomUUID/);
  assert.match(source, /api\/admin\/mutations/);
});
