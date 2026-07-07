"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { IconButton } from "@/components/ui/icon-button";

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Optional slot for content placed at the top right of the header (e.g. badge). */
  headerAside?: React.ReactNode;
  children?: React.ReactNode;
  /** Slot for primary actions (typically Cancel + Save buttons). */
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  /** Pass false to disable backdrop click-to-close. */
  dismissable?: boolean;
}

const sizeMap = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
} as const;

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  headerAside,
  children,
  footer,
  size = "md",
  dismissable = true,
}: DialogProps) {
  const ref = React.useRef<HTMLDialogElement>(null);
  const titleId = React.useId();

  React.useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Track native close (Escape)
  React.useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const handleClose = () => onOpenChange(false);
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onOpenChange]);

  const handleClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (!dismissable) return;
    const dialog = ref.current;
    if (!dialog) return;
    // The <dialog> element itself receives clicks when the backdrop is
    // clicked (the dialog fills the viewport).
    if (event.target === dialog) onOpenChange(false);
  };

  return (
    <dialog
      ref={ref}
      onClick={handleClick}
      onCancel={(e) => {
        if (!dismissable) e.preventDefault();
      }}
      aria-labelledby={title ? titleId : undefined}
      className={cn(
        "p-0 bg-transparent text-[var(--color-text)]",
        "backdrop:bg-black/50 backdrop:backdrop-blur-sm",
        "open:animate-[dialog-in_180ms_cubic-bezier(0.16,1,0.3,1)]"
      )}
    >
      <div
        className={cn(
          "fixed inset-0 m-auto h-fit max-h-[min(90vh,calc(100dvh-4rem))]",
          "w-[calc(100vw-2rem)]",
          sizeMap[size],
          "flex flex-col overflow-hidden rounded-[var(--radius-lg)]",
          "bg-[var(--color-surface-raised)] border border-[var(--color-border)]",
          "shadow-[var(--shadow-xl)]"
        )}
      >
        {(title || headerAside) && (
          <header className="flex items-start justify-between gap-4 px-6 pt-5 pb-3 border-b border-[var(--color-border)]">
            <div className="min-w-0 flex-1">
              {title ? (
                <h2
                  id={titleId}
                  className="text-base font-semibold tracking-tight text-[var(--color-text)]"
                >
                  {title}
                </h2>
              ) : null}
              {description ? (
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  {description}
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              {headerAside}
              <IconButton
                icon={X}
                onClick={() => onOpenChange(false)}
                aria-label="Close dialog"
                size="sm"
                variant="ghost"
                rounded="full"
              />
            </div>
          </header>
        )}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer ? (
          <footer className="flex items-center justify-end gap-2 border-t border-[var(--color-border)] bg-[var(--color-surface-sunken)]/40 px-6 py-3">
            {footer}
          </footer>
        ) : null}
      </div>
    </dialog>
  );
}
