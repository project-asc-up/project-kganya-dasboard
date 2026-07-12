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

const CHATWOOT_SCRIPT_ID = "chatwoot-sdk";

function resolveChatwootConfig() {
  const websiteToken = process.env.NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN?.trim();
  if (!websiteToken) return null;

  const baseUrl =
    process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL?.trim().replace(/\/$/, "") ||
    "https://app.chatwoot.com";

  return { websiteToken, baseUrl };
}

export function ChatwootWidget() {
  const { isLoaded, isSignedIn } = useAuth();
  const chatwootConfig = resolveChatwootConfig();

  useEffect(() => {
    if (!isLoaded || !isSignedIn || window.chatwootWidgetBooted || !chatwootConfig) return;

    const runChatwoot = () => {
      if (window.chatwootWidgetBooted) return;
      window.chatwootWidgetBooted = true;
      window.chatwootSDK?.run({
        websiteToken: chatwootConfig.websiteToken,
        baseUrl: chatwootConfig.baseUrl,
      });
    };

    const scriptSrc = `${chatwootConfig.baseUrl}/packs/js/sdk.js`;
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
    script.src = scriptSrc;
    script.async = true;
    script.onload = runChatwoot;
    document.body.appendChild(script);
  }, [chatwootConfig, isLoaded, isSignedIn]);

  return null;
}
