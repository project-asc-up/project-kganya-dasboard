import test from "node:test";
import assert from "node:assert/strict";

import {
  AUTH_SESSION_COOKIE,
  createAuthSessionToken,
  verifyAuthSessionToken,
} from "@/lib/auth-session";

const secret = "test-secret-with-enough-entropy";

test("auth session tokens verify with the configured secret", async () => {
  const token = await createAuthSessionToken({
    username: "admin",
    secret,
    now: 1_700_000_000_000,
  });

  const session = await verifyAuthSessionToken(token, {
    secret,
    now: 1_700_000_001_000,
  });

  assert.equal(AUTH_SESSION_COOKIE, "asc_admin_session");
  assert.deepEqual(session, {
    username: "admin",
    expiresAt: 1_700_000_000_000 + 1000 * 60 * 60 * 8,
  });
});

test("auth session tokens reject tampered payloads", async () => {
  const token = await createAuthSessionToken({
    username: "admin",
    secret,
    now: 1_700_000_000_000,
  });
  const tampered = `${token.slice(0, -1)}${token.endsWith("a") ? "b" : "a"}`;

  const session = await verifyAuthSessionToken(tampered, {
    secret,
    now: 1_700_000_001_000,
  });

  assert.equal(session, null);
});

test("auth session tokens reject expired sessions", async () => {
  const token = await createAuthSessionToken({
    username: "admin",
    secret,
    now: 1_700_000_000_000,
  });

  const session = await verifyAuthSessionToken(token, {
    secret,
    now: 1_700_000_000_000 + 1000 * 60 * 60 * 9,
  });

  assert.equal(session, null);
});
