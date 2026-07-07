"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { buttonVariants, type ButtonProps } from "./button";
import type { LucideIcon } from "lucide-react";

export interface IconButtonProps extends Omit<ButtonProps, "size"> {
  /**
   * Required aria-label for icon-only buttons.
   * Screen readers announce this; sighted users see the icon.
   */
  "aria-label": string;
  /**
   * Optional icon component to render.
   */
  icon?: LucideIcon;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ className, variant, asChild, loading, disabled, children, icon: Icon, ...props }, ref) {
    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<any>;
      return React.cloneElement(child, {
        className: cn(buttonVariants({ variant, size: "icon" }), className, child.props.className),
        ...props,
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
        className={cn(buttonVariants({ variant, size: "icon" }), className)}
        {...props}
      >
        {loading ? (
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          />
        ) : (
          <>
            {Icon && <Icon className="h-4 w-4" />}
            {children}
          </>
        )}
      </button>
    );
  }
);
