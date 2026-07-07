"use client";

import { useFormStatus } from "react-dom";
import { ActionButton } from "@/components/admin-form";
import type { ReactNode } from "react";

export function ClientActionButton({
  children,
  loadingText,
  tone = "primary",
  disabled = false,
}: {
  children: ReactNode;
  loadingText: string;
  tone?: "primary" | "secondary" | "danger";
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <ActionButton
      type="submit"
      tone={tone}
      disabled={disabled}
      loading={pending}
      loadingText={loadingText}
    >
      {children}
    </ActionButton>
  );
}
