"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function GoogleSignInButton() {
  const { fetchStatus, signIn } = useSignIn();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    if (!signIn || isSubmitting || fetchStatus === "fetching") return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await signIn.sso({
        strategy: "oauth_google",
        redirectCallbackUrl: "/sso-callback",
        redirectUrl: "/admin",
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (caught) {
      setIsSubmitting(false);
      setError(caught instanceof Error ? caught.message : "Google sign-in is unavailable right now.");
    }
  };

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="secondary"
        onClick={handleGoogleSignIn}
        disabled={!signIn || fetchStatus === "fetching"}
        loading={isSubmitting}
        loadingText="Connecting to Google..."
        className="min-h-12 w-full gap-3 font-semibold shadow-[var(--shadow-sm)]"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[conic-gradient(from_45deg,#ea4335_0_25%,#fbbc05_25%_50%,#34a853_50%_75%,#4285f4_75%_100%)]" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-white" />
        </span>
        Continue with Google
      </Button>

      {error ? (
        <p className="text-xs leading-5 text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
