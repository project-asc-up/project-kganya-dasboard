import test from "node:test";
import assert from "node:assert/strict";

import {
  LOGIN_USERNAME_PATTERN,
  validateLoginFields,
} from "@/lib/login-validation";

test("login username pattern accepts admin and lowercase u-number usernames only", () => {
  assert.equal(LOGIN_USERNAME_PATTERN.test("admin"), true);
  assert.equal(LOGIN_USERNAME_PATTERN.test("u12345678"), true);

  assert.equal(LOGIN_USERNAME_PATTERN.test("Admin"), false);
  assert.equal(LOGIN_USERNAME_PATTERN.test("u1234567"), false);
  assert.equal(LOGIN_USERNAME_PATTERN.test("u123456789"), false);
  assert.equal(LOGIN_USERNAME_PATTERN.test("U12345678"), false);
  assert.equal(LOGIN_USERNAME_PATTERN.test("staff"), false);
});

test("login validation returns user-friendly field messages", () => {
  assert.deepEqual(
    validateLoginFields({ username: "staff", password: "secret" }),
    {
      username:
        "Use admin or a lowercase u followed by exactly eight digits, for example u12345678.",
    },
  );

  assert.deepEqual(validateLoginFields({ username: "admin", password: "" }), {
    password: "Enter your password.",
  });
});
