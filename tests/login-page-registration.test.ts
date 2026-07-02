import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

function readSourceFile(pathFromRoot: string) {
  return readFileSync(join(process.cwd(), pathFromRoot), "utf8");
}

test("login page replaces admin hint banner with create account flow", () => {
  const source = readSourceFile("src/components/login-form.tsx");
  const pageSource = readSourceFile("src/app/page.tsx");

  assert.doesNotMatch(source, /Supa administrators may use/);
  assert.doesNotMatch(source, /ShieldCheck/);
  assert.doesNotMatch(pageSource, /Supa administrator account/);
  assert.match(pageSource, /administrator credentials/);
  assert.match(source, /Create an Account/);
  assert.match(source, /registerAction/);
  assert.match(source, /validateRegistrationFields/);
});
