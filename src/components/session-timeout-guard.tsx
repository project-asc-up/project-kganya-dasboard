"use client";

import { useAuth, useClerk } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

const INACTIVITY_TIMEOUT_MS = 3 * 60 * 1000;
const CHECK_INTERVAL_MS = 10 * 1000;
const ACTIVITY_SYNC_WINDOW_MS = 1000;
const LAST_ACTIVITY_KEY = "asc:last-activity-at";
const LOGOUT_SIGNAL_KEY = "asc:logout-signal-at";
const BACKEND_PING_INTERVAL_MS = 60 * 1000; // 1 minute

function parseTimestamp(value: string | null) {
  if (!value) return null;
  const timestamp = Number(value);
  if (!Number.isFinite(timestamp)) return null;
  return timestamp;
}

function readLastActivity() {
  try {
    return parseTimestamp(window.localStorage.getItem(LAST_ACTIVITY_KEY));
  } catch {
    return null;
  }
}

function writeLastActivity(value: number) {
  try {
    window.localStorage.setItem(LAST_ACTIVITY_KEY, String(value));
  } catch {
    // No-op if storage is unavailable.
  }
}

function broadcastLogout() {
  try {
    window.localStorage.setItem(LOGOUT_SIGNAL_KEY, String(Date.now()));
  } catch {
    // No-op if storage is unavailable.
  }
}

export function SessionTimeoutGuard() {
  const { signOut } = useClerk();
  const { isSignedIn, sessionId } = useAuth();
  const lastActivityRef = useRef(0);
  const lastSyncedRef = useRef(0);
  const lastBackendPingRef = useRef(0);
  const loggingOutRef = useRef(false);

  useEffect(() => {
    if (!isSignedIn || !sessionId) return;

    const registerActivity = () => {
      const now = Date.now();
      lastActivityRef.current = now;

      if (now - lastSyncedRef.current >= ACTIVITY_SYNC_WINDOW_MS) {
        writeLastActivity(now);
        lastSyncedRef.current = now;
      }

      if (now - lastBackendPingRef.current >= BACKEND_PING_INTERVAL_MS) {
        lastBackendPingRef.current = now;
        fetch("/api/admin/ping").catch(() => {});
      }
    };

    const maybeLogout = async () => {
      if (loggingOutRef.current) return;

      const idleDuration = Date.now() - lastActivityRef.current;
      if (idleDuration < INACTIVITY_TIMEOUT_MS) return;

      loggingOutRef.current = true;
      broadcastLogout();

      try {
        await signOut({
          sessionId,
          redirectUrl: "/sign-in",
        });
      } catch {
        window.location.assign("/sign-in");
      }
    };

    const persistedActivity = readLastActivity();
    if (persistedActivity) {
      lastActivityRef.current = persistedActivity;
      lastSyncedRef.current = persistedActivity;
    } else {
      registerActivity();
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === LAST_ACTIVITY_KEY) {
        const nextValue = parseTimestamp(event.newValue);
        if (nextValue) {
          lastActivityRef.current = Math.max(lastActivityRef.current, nextValue);
        }
      }

      if (event.key === LOGOUT_SIGNAL_KEY && event.newValue) {
        window.location.assign("/sign-in");
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void maybeLogout();
      }
    };

    const activityEvents: Array<keyof WindowEventMap> = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "pointerdown",
      "wheel",
    ];

    for (const eventName of activityEvents) {
      window.addEventListener(eventName, registerActivity, { passive: true });
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("storage", handleStorage);

    const intervalId = window.setInterval(() => {
      void maybeLogout();
    }, CHECK_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("storage", handleStorage);

      for (const eventName of activityEvents) {
        window.removeEventListener(eventName, registerActivity);
      }
    };
  }, [isSignedIn, sessionId, signOut]);

  return null;
}
