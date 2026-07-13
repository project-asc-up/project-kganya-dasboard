import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

function readSourceFile(pathFromRoot: string) {
  return readFileSync(join(process.cwd(), pathFromRoot), "utf8");
}

test("login page uses Clerk sign-in and hides in-app registration UI", () => {
  const pageSource = readSourceFile("src/app/page.tsx");
  const layoutSource = readSourceFile("src/app/layout.tsx");
  const proxySource = readSourceFile("src/proxy.ts");
  const signInSource = readSourceFile("src/app/sign-in/[[...sign-in]]/page.tsx");
  const signUpSource = readSourceFile("src/app/sign-up/[[...sign-up]]/page.tsx");
  const adminShellSource = readSourceFile("src/components/admin-shell.tsx");
  const timeoutGuardSource = readSourceFile("src/components/session-timeout-guard.tsx");

  assert.doesNotMatch(pageSource, /LoginForm/);
  assert.doesNotMatch(pageSource, /administrator credentials/);
  assert.doesNotMatch(pageSource, /university ID/);
  assert.match(pageSource, /Show/);
  assert.match(pageSource, /UserButton/);
  assert.doesNotMatch(pageSource, /Create an Account/);
  assert.match(pageSource, /href="\/sign-in"/);
  assert.match(pageSource, /Open Admin Workspace/);
  assert.match(layoutSource, /<ClerkProvider>/);
  assert.match(proxySource, /clerkMiddleware/);
  assert.match(proxySource, /auth\.protect/);
  assert.match(proxySource, /new URL\("\/sign-in", middlewareRequest\.url\)\.toString\(\)/);
  assert.match(proxySource, /new URL\("\/", middlewareRequest\.url\)\.toString\(\)/);
  assert.match(proxySource, /unauthenticatedUrl: signInUrl/);
  assert.match(proxySource, /unauthorizedUrl/);
  assert.match(proxySource, /"\/\(api\|trpc\)\(\.\*\)"/);
  assert.match(proxySource, /"\/__clerk\/:path\*"/);
  assert.match(signInSource, /fallbackRedirectUrl="\/admin"/);
  assert.match(signInSource, /forceRedirectUrl="\/admin"/);
  assert.doesNotMatch(signInSource, /signUpUrl=/);
  assert.match(signUpSource, /redirect\("\/sign-in"\)/);
  assert.match(adminShellSource, /SessionTimeoutGuard/);
  assert.match(timeoutGuardSource, /INACTIVITY_TIMEOUT_MS = 3 \* 60 \* 1000/);
  assert.match(timeoutGuardSource, /signOut/);
  assert.match(timeoutGuardSource, /redirectUrl: "\/sign-in"/);
  assert.match(timeoutGuardSource, /mousemove/);
  assert.match(timeoutGuardSource, /keydown/);
  assert.match(timeoutGuardSource, /scroll/);
  assert.match(timeoutGuardSource, /touchstart/);
});
