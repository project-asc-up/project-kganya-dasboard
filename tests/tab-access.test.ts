import test from "node:test";
import assert from "node:assert/strict";

import { isPathAllowed } from "../src/lib/tab-access";

test("isPathAllowed allows exact matches", () => {
  const allowed = ["/admin", "/admin/faculties", "/admin/coaches"];

  assert.equal(isPathAllowed("/admin", allowed), true);
  assert.equal(isPathAllowed("/admin/faculties", allowed), true);
  assert.equal(isPathAllowed("/admin/coaches", allowed), true);
});

test("isPathAllowed allows admin search for an allowed admin", () => {
  assert.equal(isPathAllowed("/admin/search", ["/admin"]), true);
});

test("isPathAllowed blocks exact matches not in list", () => {
  const allowed = ["/admin", "/admin/faculties"];

  assert.equal(isPathAllowed("/admin/coaches", allowed), false);
  assert.equal(isPathAllowed("/admin/health", allowed), false);
});

test("isPathAllowed allows subpaths for allowed tabs", () => {
  const allowed = ["/admin", "/admin/faculties", "/admin/coaches"];

  assert.equal(isPathAllowed("/admin/faculties/new", allowed), true);
  assert.equal(isPathAllowed("/admin/coaches/123/edit", allowed), true);
  assert.equal(isPathAllowed("/admin/faculties/some-id/details", allowed), true);
});

test("isPathAllowed does not allow subpaths of /admin if not explicitly in list", () => {
  // If only /admin is allowed, it should not automatically allow all subroutes under /admin.
  const allowed = ["/admin"];

  assert.equal(isPathAllowed("/admin/faculties", allowed), false);
  assert.equal(isPathAllowed("/admin/coaches/123", allowed), false);
});

test("isPathAllowed blocks partial prefix matches (avoiding false positives)", () => {
  const allowed = ["/admin", "/admin/faculties"];

  // /admin/faculties-list should be blocked even though it starts with /admin/faculties
  assert.equal(isPathAllowed("/admin/faculties-list", allowed), false);
});

test("isPathAllowed always allows profile path and its subpaths", () => {
  const allowed: string[] = []; // No tabs allowed at all

  assert.equal(isPathAllowed("/admin/profile", allowed), true);
  assert.equal(isPathAllowed("/admin/profile/settings", allowed), true);
});
