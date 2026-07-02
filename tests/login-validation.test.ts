import test from "node:test";
import assert from "node:assert/strict";

import {
  LOGIN_USERNAME_PATTERN,
  REGISTER_UNIVERSITY_ID_PATTERN,
  validateRegistrationFields,
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

test("registration university ID pattern accepts lowercase u-number usernames only", () => {
  assert.equal(REGISTER_UNIVERSITY_ID_PATTERN.test("u12345678"), true);

  assert.equal(REGISTER_UNIVERSITY_ID_PATTERN.test("admin"), false);
  assert.equal(REGISTER_UNIVERSITY_ID_PATTERN.test("U12345678"), false);
  assert.equal(REGISTER_UNIVERSITY_ID_PATTERN.test("u1234567"), false);
  assert.equal(REGISTER_UNIVERSITY_ID_PATTERN.test("u123456789"), false);
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

test("registration validation requires a secure password and matching confirmation", () => {
  assert.deepEqual(
    validateRegistrationFields({
      universityId: "staff",
      password: "short",
      confirmPassword: "different",
    }),
    {
      universityId: "Use a lowercase u followed by exactly eight digits, for example u12345678.",
      password: "Use at least 10 characters with uppercase, lowercase, and a number.",
      confirmPassword: "Passwords must match.",
    },
  );

  assert.deepEqual(
    validateRegistrationFields({
      universityId: "u12345678",
      password: "Secure1234",
      confirmPassword: "Secure1234",
    }),
    {},
  );
});
