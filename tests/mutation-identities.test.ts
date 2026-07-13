import assert from "node:assert/strict";
import test from "node:test";

import { domainIdentity, faqIdentity, normalizeIdentityPart } from "@/lib/mutation-identities";

test("FAQ identity is stable across casing and whitespace", () => {
  assert.equal(
    faqIdentity({ facultyId: null, category: "Support", question: "  How  do I log in? " }),
    faqIdentity({ facultyId: null, category: "support", question: "how do i log in?" }),
  );
});

test("FAQ identity normalizes Unicode punctuation", () => {
  assert.equal(
    faqIdentity({ facultyId: "FAC-1", category: "Student’s Help", question: "Can I reset my password—today?" }),
    faqIdentity({ facultyId: "fac-1", category: "student's help", question: "can i reset my password-today?" }),
  );
});

test("faculty-scoped and general FAQs have different identities", () => {
  assert.notEqual(
    faqIdentity({ facultyId: null, category: "Support", question: "How do I log in?" }),
    faqIdentity({ facultyId: "fac-1", category: "Support", question: "How do I log in?" }),
  );
});

test("domain identities are deterministic for object fields", () => {
  assert.equal(
    domainIdentity("seed", { code: " A-1 ", name: "Example" }),
    domainIdentity("seed", { name: "example", code: "a-1" }),
  );
  assert.equal(normalizeIdentityPart("  A\tB  "), "a b");
});

test("domain identities cannot collide on delimiter characters", () => {
  assert.notEqual(domainIdentity("seed", ["a|b"]), domainIdentity("seed", ["a", "b"]));
});
