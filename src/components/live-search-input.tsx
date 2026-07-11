"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

import { TextInput } from "@/components/admin-form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { SearchSuggestion } from "@/lib/search-suggestions";

type LiveSearchInputProps = {
  value: string;
  onValueChange: (value: string) => void;
  suggestionsLoader: (query: string) => Promise<SearchSuggestion[]> | SearchSuggestion[];
  onSelectSuggestion?: (suggestion: SearchSuggestion) => void;
  placeholder: string;
  className?: string;
  inputClassName?: string;
  minChars?: number;
  debounceMs?: number;
  label?: string;
  ariaLabel?: string;
};

export function LiveSearchInput({
  value,
  onValueChange,
  suggestionsLoader,
  onSelectSuggestion,
  placeholder,
  className,
  inputClassName,
  minChars = 1,
  debounceMs = 180,
  label,
  ariaLabel,
}: LiveSearchInputProps) {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const trimmedValue = value.trim();
  const hasQuery = trimmedValue.length >= minChars;

  const helperText = hasQuery && suggestions.length === 0 ? "No suggestions yet" : "";

  useEffect(() => {
    let active = true;

    if (!hasQuery) {
      return () => {
        active = false;
      };
    }

    const timer = window.setTimeout(() => {
      Promise.resolve(suggestionsLoader(trimmedValue))
        .then((result) => {
          if (!active) return;
          setSuggestions(result);
          setIsOpen(true);
        })
        .catch(() => {
          if (!active) return;
          setSuggestions([]);
          setIsOpen(true);
        });
    }, debounceMs);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [debounceMs, hasQuery, suggestionsLoader, trimmedValue]);

  return (
    <div className={cn("relative", className)}>
      <div className="relative flex items-center">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--color-text-muted)]"
          size={16}
        />
        <TextInput
          value={value}
          onChange={(event) => {
            onValueChange(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (trimmedValue.length >= minChars) setIsOpen(true);
          }}
          onBlur={() => {
            window.setTimeout(() => setIsOpen(false), 120);
          }}
          placeholder={placeholder}
          aria-label={ariaLabel ?? label ?? placeholder}
          aria-autocomplete="list"
          aria-expanded={isOpen && hasQuery && suggestions.length > 0}
          aria-controls="live-search-suggestions"
          className={cn("pl-10", inputClassName)}
        />
      </div>

      {label ? (
        <div className="mt-1 text-xs text-[color:var(--color-text-muted)]">{label}</div>
      ) : null}

      {isOpen && hasQuery ? (
        <div
          id="live-search-suggestions"
          role="listbox"
          className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-[var(--color-surface-raised)] shadow-[0_24px_60px_rgba(0,32,80,0.16)]"
        >
          <div className="flex items-center justify-between gap-3 border-b border-[color:var(--color-border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
            <span>Live suggestions</span>
            {helperText ? <span className="normal-case tracking-normal">{helperText}</span> : null}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {suggestions.length === 0 ? (
              <div className="px-4 py-4 text-sm text-[color:var(--color-text-muted)]">Keep typing to refine the search.</div>
            ) : (
              suggestions.map((suggestion) => (
                <Button
                  key={suggestion.id}
                  variant="ghost"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    if (suggestion.href) {
                      router.push(suggestion.href);
                      return;
                    }
                    if (onSelectSuggestion) {
                      onSelectSuggestion(suggestion);
                    } else {
                      onValueChange(suggestion.value);
                    }
                    setIsOpen(false);
                  }}
                  className="flex w-full items-start justify-between gap-4 border-b border-[color:var(--color-border)] px-4 py-3 text-left h-auto rounded-none last:border-b-0 hover:bg-[var(--color-surface-sunken)]"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="truncate text-sm font-semibold text-[color:var(--color-text)]">
                      {suggestion.title}
                    </div>
                    {suggestion.detail ? (
                      <div className="truncate text-xs text-[color:var(--color-text-muted)]">
                        {suggestion.detail}
                      </div>
                    ) : null}
                  </div>
                  {suggestion.badge ? (
                    <span className="shrink-0 rounded-full bg-[var(--color-brand-soft)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-brand-soft-foreground)]">
                      {suggestion.badge}
                    </span>
                  ) : null}
                </Button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
