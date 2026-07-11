"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        <Button
          type="button"
          variant="secondary"
          size="sm"
          rounded="full"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2 text-[var(--color-brand)] hover:bg-[var(--color-brand-soft)]"
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
        </Button>
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
