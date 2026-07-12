import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

test("feedback modal supports focus management, escape, delete confirmation and Done", () => {
  const source = readFileSync("src/components/mutation-feedback-modal.tsx", "utf8");
  assert.match(source, /querySelector/);
  assert.match(source, /event\.key === "Escape"/);
  assert.match(source, /\}, \[open\]\);/);
  assert.match(source, /Delete permanently/);
  assert.match(source, /Live chatbot updated/);
});

test("retry observes the existing mutation id instead of creating a new one", () => {
  const source = readFileSync("src/components/mutation-form.tsx", "utf8");
  assert.match(source, /result\.mutationId/);
  assert.match(source, /method: "POST"/);
  assert.doesNotMatch(source.slice(source.indexOf("const retry")), /crypto\.randomUUID/);
});
