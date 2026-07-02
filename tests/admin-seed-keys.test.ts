import test from "node:test";
import assert from "node:assert/strict";

import { buildAdminSeedKey, resolveUniqueAdminSeedKey } from "@/lib/admin-seed-keys";

test("buildAdminSeedKey keeps existing seed-key format", () => {
  assert.equal(
    buildAdminSeedKey("resource", "EMS", "Study Skills"),
    "resource::EMS::Study Skills",
  );
  assert.equal(
    buildAdminSeedKey("resource", null, "Study Skills"),
    "resource::general::Study Skills",
  );
});

test("resolveUniqueAdminSeedKey returns the base key when it is unused", async () => {
  const key = await resolveUniqueAdminSeedKey("resource::EMS::Study Skills", async () => false);

  assert.equal(key, "resource::EMS::Study Skills");
});

test("resolveUniqueAdminSeedKey appends the next available numeric suffix", async () => {
  const existing = new Set([
    "resource::EMS::Study Skills",
    "resource::EMS::Study Skills::2",
  ]);

  const key = await resolveUniqueAdminSeedKey(
    "resource::EMS::Study Skills",
    async (candidate) => existing.has(candidate),
  );

  assert.equal(key, "resource::EMS::Study Skills::3");
});
