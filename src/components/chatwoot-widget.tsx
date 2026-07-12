"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

declare global {
  interface Window {
    chatwootSDK?: {
      run: (config: { websiteToken: string; baseUrl: string }) => void;
    };
    chatwootWidgetBooted?: boolean;
  }
}

const CHATWOOT_BASE_URL = "https://app.chatwoot.com";
const CHATWOOT_WEBSITE_TOKEN = "ENwKsLtCoELnGq396HZThziu";
const CHATWOOT_SCRIPT_ID = "chatwoot-sdk";
const CHATWOOT_SCRIPT_SRC = `${CHATWOOT_BASE_URL}/packs/js/sdk.js`;

export function ChatwootWidget() {
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded || !isSignedIn || window.chatwootWidgetBooted) return;

    const runChatwoot = () => {
      if (window.chatwootWidgetBooted) return;
      window.chatwootWidgetBooted = true;
      window.chatwootSDK?.run({
        websiteToken: CHATWOOT_WEBSITE_TOKEN,
        baseUrl: CHATWOOT_BASE_URL,
      });
    };

    const existingScript = document.getElementById(CHATWOOT_SCRIPT_ID);
    if (existingScript) {
      if (window.chatwootSDK) {
        runChatwoot();
      } else {
        existingScript.addEventListener("load", runChatwoot, { once: true });
      }
      return;
    }

    const script = document.createElement("script");
    script.id = CHATWOOT_SCRIPT_ID;
    script.src = CHATWOOT_SCRIPT_SRC;
    script.async = true;
    script.onload = runChatwoot;
    document.body.appendChild(script);
  }, [isLoaded, isSignedIn]);

  return null;
}
