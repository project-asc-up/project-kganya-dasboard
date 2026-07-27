"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CollapsibleSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export function CollapsibleSection({
  title,
  description,
  children,
  defaultExpanded = false,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <section className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-6 shadow-[0_12px_40px_rgba(0,32,80,0.04)] hover-lift animate-slide-up">
      <div className="flex items-start justify-between gap-4">
        <div className="max-w-3xl">
          <h2 className="text-xl font-semibold tracking-tight text-[color:var(--color-primary-dark)]">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-sm leading-6 text-[color:var(--color-text-muted)]">
              {description}
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          rounded="full"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          className="gap-2 text-[var(--color-brand)] hover:bg-[var(--color-brand-soft)] shrink-0"
        >
          {isExpanded ? (
            <>
              Collapse <ChevronUp size={14} />
            </>
          ) : (
            <>
              Expand <ChevronDown size={14} />
            </>
          )}
        </Button>
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isExpanded ? "grid-rows-[1fr] opacity-100 mt-5" : "grid-rows-[0fr] opacity-0 pointer-events-none mt-0"
        }`}
      >
        <div className="overflow-hidden">
          {children}
        </div>
      </div>
    </section>
  );
}
