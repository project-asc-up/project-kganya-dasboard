"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  // Base — applied to every variant. Focus ring, transition, disabled state.
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-[var(--radius-md)] font-medium",
    "transition-all duration-200 active:scale-[0.98]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--color-brand)] text-[var(--color-brand-foreground)] hover:bg-[var(--color-brand-strong)] hover:shadow-md shadow-sm",
        secondary:
          "bg-[var(--color-surface-raised)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-surface-sunken)] hover:border-[var(--color-border-strong)]",
        ghost:
          "bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface-sunken)]",
        danger:
          "bg-[var(--color-danger)] text-[var(--color-danger-foreground)] hover:bg-[var(--color-danger-strong)] hover:shadow-md shadow-sm",
        outline:
          "bg-transparent text-[var(--color-brand)] border border-[var(--color-brand)] hover:bg-[var(--color-brand-soft)] hover:text-[var(--color-brand-soft-foreground)]",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10 p-0",
      },
      rounded: {
        default: "rounded-[var(--radius-md)]",
        full: "rounded-full",
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      rounded: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
}

/**
 * A simple implementation of the "asChild" pattern.
 * If asChild is true, it renders the child element and merges props.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant, size, rounded, asChild = false, loading, loadingText, disabled, children, ...props },
    ref
  ) {
    // When asChild is true, we expect exactly one child which is a React element.
    // We then clone that child and inject our styles and behavior.
    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<any>;
      return React.cloneElement(child, {
        className: cn(buttonVariants({ variant, size, rounded }), className, child.props.className),
        ...props,
        // Merge refs if necessary
        ref: (node: any) => {
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as any).current = node;
          if ((child as any).ref) {
            if (typeof (child as any).ref === "function") (child as any).ref(node);
            else (child as any).ref.current = node;
          }
        },
      });
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={cn(buttonVariants({ variant, size, rounded }), className)}
        {...props}
      >
        {loading ? (
          <>
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
            />
            {loadingText ? <span>{loadingText}</span> : children}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

export { buttonVariants };
