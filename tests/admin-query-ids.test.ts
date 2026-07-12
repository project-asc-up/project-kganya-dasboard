import test from "node:test";
import assert from "node:assert/strict";

import { isUuid } from "../src/lib/admin-queries";

test("isUuid rejects malformed route parameters before Prisma", () => {
  assert.equal(isUuid("not-a-real-id"), false);
  assert.equal(isUuid("2496510e-6732-40bb-a033-16720d340dbf"), true);
});
