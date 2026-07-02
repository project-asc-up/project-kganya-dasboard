import test from "node:test";
import assert from "node:assert/strict";

import { hashPassword, verifyPassword } from "@/lib/password-hashing";

test("password hashing stores a non-plain-text scrypt hash", async () => {
  const hash = await hashPassword("Secure1234");

  assert.notEqual(hash, "Secure1234");
  assert.match(hash, /^scrypt\$/);
  assert.equal(await verifyPassword("Secure1234", hash), true);
  assert.equal(await verifyPassword("Wrong1234", hash), false);
});

test("password verification rejects malformed hashes", async () => {
  assert.equal(await verifyPassword("Secure1234", "not-a-valid-hash"), false);
});
