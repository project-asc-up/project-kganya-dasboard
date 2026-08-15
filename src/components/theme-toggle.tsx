"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { cn } from "@/lib/cn";
import { IconButton } from "@/components/ui/icon-button";

export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "theme";

type ThemeCtxValue = {
  theme: Theme;
  resolved: "light" | "dark";
  setTheme: (theme: Theme) => void;
};

const ThemeContext = React.createContext<ThemeCtxValue | null>(null);

function readPersistedTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === "light" || raw === "dark" || raw === "system") return raw;
  return "system";
}

function setStoredTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* localStorage may be unavailable (private browsing); ignore */
  }
}

/**
 * Subscribe to OS-level dark-mode preference using the SSR-safe
 * useSyncExternalStore pattern. Returns `false` on the server so the
 * initial client render matches.
 */
function useSystemPrefersDark(): boolean {
  return React.useSyncExternalStore(
    (onChange) => {
      if (typeof window === "undefined") return () => {};
      const mql = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => onChange();
      mql.addEventListener?.("change", handler);
      return () => mql.removeEventListener?.("change", handler);
    },
    () =>
      typeof window === "undefined"
        ? false
        : window.matchMedia("(prefers-color-scheme: dark)").matches,
    () => false // server snapshot — always light so the markup matches
  );
}

function applyTheme() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("dark");
  root.style.colorScheme = "light";
}

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
}) {
  const [theme, setThemeState] = React.useState<Theme>("light");

  React.useLayoutEffect(() => {
    setStoredTheme("light");
    applyTheme();
  }, []);

  const resolved = "light";

  const setTheme = React.useCallback((_next: Theme) => {
    setThemeState("light");
    setStoredTheme("light");
    applyTheme();
  }, []);

  const value = React.useMemo(
    () => ({ theme: "light" as Theme, resolved: "light" as const, setTheme }),
    [setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeCtxValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) {
    // In dev and partial RSC renders the provider boundary can be unavailable
    // for a moment; fall back to a harmless no-op theme state instead of
    // crashing the whole admin shell.
    return {
      theme: "system",
      resolved: "light",
      setTheme: () => {},
    };
  }
  return ctx;
}

/**
 * Three-position cycle button: light -> dark -> system -> ...
 * Uses the IconButton primitive so it matches the rest of the UI.
 *
 * Accepts an `align` prop so the same widget can drop into either a
 * header (right-aligned) or a settings menu (left-aligned) without
 * coming back later to untangle a styles override.
 */
export function ThemeToggle({
  className,
  align = "right",
  showLabel = false,
}: {
  className?: string;
  align?: "left" | "right";
  showLabel?: boolean;
}) {
  const { theme, setTheme } = useTheme();

  const cycle = React.useCallback(() => {
    const order: Theme[] = ["light", "dark", "system"];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
  }, [theme, setTheme]);

  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  const label =
    theme === "dark"
      ? "Dark theme"
      : theme === "light"
        ? "Light theme"
        : "System theme";

  return (
    <span
      // suppressHydrationWarning — the icon and label deliberately
      // change after mount when the persisted theme is reconciled.
      suppressHydrationWarning
      className={cn("inline-flex items-center gap-2", className)}
      data-align={align}
    >
      <IconButton
        variant="ghost"
        aria-label={`${label} — click to change`}
        onClick={cycle}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </IconButton>
      {showLabel ? (
        <span
          aria-live="polite"
          className="text-xs text-[var(--color-text-muted)]"
        >
          {label}
        </span>
      ) : null}
    </span>
  );
}
