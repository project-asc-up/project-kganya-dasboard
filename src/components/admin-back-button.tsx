"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminBackButton() {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      rounded="full"
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
          return;
        }

        router.push("/admin");
      }}
      className="gap-2"
      aria-label="Go back"
    >
      <ArrowLeft size={16} aria-hidden="true" />
      Back
    </Button>
  );
}
