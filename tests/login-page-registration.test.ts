import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

function readSourceFile(pathFromRoot: string) {
  return readFileSync(join(process.cwd(), pathFromRoot), "utf8");
}

test("login page uses Clerk sign-in, sign-up, and user controls", () => {
  const pageSource = readSourceFile("src/app/page.tsx");
  const layoutSource = readSourceFile("src/app/layout.tsx");
  const proxySource = readSourceFile("src/proxy.ts");
  const signInSource = readSourceFile("src/app/sign-in/[[...sign-in]]/page.tsx");
  const signUpSource = readSourceFile("src/app/sign-up/[[...sign-up]]/page.tsx");

  assert.doesNotMatch(pageSource, /LoginForm/);
  assert.doesNotMatch(pageSource, /administrator credentials/);
  assert.doesNotMatch(pageSource, /university ID/);
  assert.match(pageSource, /SignInButton/);
  assert.match(pageSource, /SignUpButton/);
  assert.match(pageSource, /Show/);
  assert.match(pageSource, /UserButton/);
  assert.match(pageSource, /Create an Account/);
  assert.match(layoutSource, /<ClerkProvider>/);
  assert.match(proxySource, /clerkMiddleware/);
  assert.match(proxySource, /auth\.protect/);
  assert.match(proxySource, /new URL\("\/sign-in", request\.url\)\.toString\(\)/);
  assert.match(proxySource, /new URL\("\/", request\.url\)\.toString\(\)/);
  assert.match(proxySource, /unauthenticatedUrl: signInUrl/);
  assert.match(proxySource, /unauthorizedUrl/);
  assert.match(proxySource, /"\/\(api\|trpc\)\(\.\*\)"/);
  assert.match(proxySource, /"\/__clerk\/:path\*"/);
  assert.match(signInSource, /fallbackRedirectUrl="\/admin"/);
  assert.match(signInSource, /forceRedirectUrl="\/admin"/);
  assert.match(signUpSource, /fallbackRedirectUrl="\/admin"/);
  assert.match(signUpSource, /forceRedirectUrl="\/admin"/);
});
