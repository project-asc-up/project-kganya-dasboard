"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  onSubmit?: () => void | Promise<void>;
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
};

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  isLoading = false,
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Focus management
  useEffect(() => {
    if (open) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      // Move focus into dialog
      const focusableElement = dialogRef.current?.querySelector(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
      ) as HTMLElement;
      focusableElement?.focus();
    } else if (previousActiveElement.current) {
      previousActiveElement.current.focus();
    }
  }, [open]);

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    },
    [open, onOpenChange]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "unset";
      };
    }
  }, [open, handleKeyDown]);

  // Handle click outside
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onOpenChange(false);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-fade-in"
        onClick={handleBackdropClick}
        role="presentation"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 animate-modal-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby={description ? "dialog-description" : undefined}
      >
        <div className="rounded-2xl border border-[color:var(--color-border)] bg-white shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="border-b border-[color:var(--color-border)] px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="dialog-title"
                  className="text-xl font-semibold tracking-tight text-[color:var(--color-primary-dark)]"
                >
                  {title}
                </h2>
                {description && (
                  <p
                    id="dialog-description"
                    className="mt-1 text-sm text-[color:var(--color-text-muted)]"
                  >
                    {description}
                  </p>
                )}
              </div>
              <IconButton
                variant="ghost"
                onClick={() => onOpenChange(false)}
                aria-label="Close dialog"
                className="rounded-full"
              >
                <X size={20} />
              </IconButton>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-5">{children}</div>

          {/* Footer */}
          {onSubmit && (
            <div className="flex gap-3 border-t border-[color:var(--color-border)] px-6 py-4">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="flex-1"
              >
                {cancelLabel}
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={onSubmit}
                loading={isLoading}
                loadingText="Loading..."
                className="flex-1"
              >
                {submitLabel}
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

type DialogTriggerProps = {
  asChild?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
};

export function DialogTrigger({
  asChild = false,
  onClick,
  children,
}: DialogTriggerProps) {
  if (asChild) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, { onClick });
  }

  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className="h-auto p-0 font-normal hover:bg-transparent opacity-100 hover:opacity-90"
    >
      {children}
    </Button>
  );
}
