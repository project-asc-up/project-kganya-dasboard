import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

test("chatwoot loads only from the authenticated app shell", () => {
  const layoutSource = readFileSync("src/app/layout.tsx", "utf8");
  const widgetSource = readFileSync("src/components/chatwoot-widget.tsx", "utf8");

  assert.match(layoutSource, /<ChatwootWidget \/>/);
  assert.match(widgetSource, /useAuth\(\)/);
  assert.match(widgetSource, /isLoaded \|\| !isSignedIn/);
  assert.match(widgetSource, /chatwootSDK\?\.run/);
  assert.match(widgetSource, /CHATWOOT_WEBSITE_TOKEN\s*=\s*["']ENwKsLtCoELnGq396HZThziu["']/);
  assert.match(widgetSource, /CHATWOOT_BASE_URL\s*=\s*["']https:\/\/app\.chatwoot\.com["']/);
});
