import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

test("chatwoot loads only from the authenticated app shell", () => {
  const layoutSource = readFileSync("src/app/layout.tsx", "utf8");
  const widgetSource = readFileSync("src/components/chatwoot-widget.tsx", "utf8");
  const envSource = readFileSync(".env.example", "utf8");

  assert.match(layoutSource, /<ChatwootWidget \/>/);
  assert.match(widgetSource, /useAuth\(\)/);
  assert.match(widgetSource, /isLoaded \|\| !isSignedIn/);
  assert.match(widgetSource, /chatwootSDK\?\.run/);
  assert.match(widgetSource, /NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN/);
  assert.match(widgetSource, /NEXT_PUBLIC_CHATWOOT_BASE_URL/);
  assert.match(envSource, /NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN=/);
  assert.match(envSource, /NEXT_PUBLIC_CHATWOOT_BASE_URL=https:\/\/app\.chatwoot\.com/);
});
