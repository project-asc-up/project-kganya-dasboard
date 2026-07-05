"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export function UserSearchAccordion({
  children,
  defaultExpanded,
}: {
  children: React.ReactNode;
  defaultExpanded: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-xs font-semibold text-[var(--color-brand)] hover:bg-[var(--color-brand-soft)] transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 cursor-pointer"
        >
          {isExpanded ? (
            <>
              Hide Search Panel <ChevronUp size={14} />
            </>
          ) : (
            <>
              Show Search Panel <ChevronDown size={14} />
            </>
          )}
        </button>
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
        }`}
      >
        <div className="overflow-hidden">
          <div className="pt-2">{children}</div>
        </div>
      </div>
    </div>
  );
}
