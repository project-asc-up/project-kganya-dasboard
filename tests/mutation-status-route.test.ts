import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

test("mutation status route requires authorization and exposes sync state", () => {
  const source = readFileSync("src/app/api/admin/mutations/[mutationId]/route.ts", "utf8");
  assert.match(source, /getCurrentAuthorization/);
  assert.match(source, /status: 401/);
  assert.match(source, /status: 403/);
  assert.match(source, /difySyncJob/);
  assert.match(source, /persistence/);
  assert.match(source, /not_applicable/);
  assert.match(source, /error: syncJob/);
});
