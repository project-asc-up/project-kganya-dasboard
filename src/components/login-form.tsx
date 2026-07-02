"use client";

import { useActionState, useId, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, LockKeyhole, LogIn, ShieldCheck, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { loginAction } from "@/lib/login-actions";
import {
  initialLoginActionState,
  type LoginFieldErrors,
  validateLoginFields,
} from "@/lib/login-validation";

export function LoginForm() {
  const usernameId = useId();
  const usernameErrorId = useId();
  const passwordId = useId();
  const passwordErrorId = useId();
  const formErrorId = useId();
  const [state, formAction] = useActionState(
    loginAction,
    initialLoginActionState,
  );
  const [clientErrors, setClientErrors] = useState<LoginFieldErrors>({});

  const fieldErrors = {
    ...state.fieldErrors,
    ...clientErrors,
  };

  return (
    <form
      action={formAction}
      noValidate
      onSubmit={(event) => {
        const formData = new FormData(event.currentTarget);
        const nextClientErrors = validateLoginFields({
          username: formData.get("username"),
          password: formData.get("password"),
        });

        setClientErrors(nextClientErrors);

        if (nextClientErrors.username || nextClientErrors.password) {
          event.preventDefault();
        }
      }}
      className="space-y-5"
    >
      {state.formError ? (
        <div
          id={formErrorId}
          role="alert"
          className="flex gap-3 rounded-[var(--radius-md)] border border-[var(--color-danger)] bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-[var(--color-text)]"
        >
          <AlertCircle
            className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-danger)]"
            aria-hidden="true"
          />
          <span>{state.formError}</span>
        </div>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={usernameId}
          className="text-sm font-medium text-[var(--color-text)]"
        >
          Username
          <span aria-hidden="true" className="ml-1 text-[var(--color-danger)]">
            *
          </span>
        </label>
        <div className="relative">
          <UserRound
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-subtle)]"
            aria-hidden="true"
          />
          <Input
            id={usernameId}
            name="username"
            autoComplete="username"
            inputMode="text"
            pattern="^(admin|u\\d{8})$"
            placeholder="u12345678"
            aria-invalid={fieldErrors.username ? true : undefined}
            aria-describedby={fieldErrors.username ? usernameErrorId : undefined}
            className={cn(
              "pl-10",
              fieldErrors.username &&
                "border-[var(--color-danger)] focus-visible:border-[var(--color-danger)] focus-visible:ring-[var(--color-danger)]",
            )}
            onChange={() => {
              if (clientErrors.username) {
                setClientErrors((current) => ({
                  ...current,
                  username: undefined,
                }));
              }
            }}
          />
        </div>
        {fieldErrors.username ? (
          <p id={usernameErrorId} role="alert" className="text-xs text-[var(--color-danger)]">
            {fieldErrors.username}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={passwordId}
          className="text-sm font-medium text-[var(--color-text)]"
        >
          Password
          <span aria-hidden="true" className="ml-1 text-[var(--color-danger)]">
            *
          </span>
        </label>
        <div className="relative">
          <LockKeyhole
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-subtle)]"
            aria-hidden="true"
          />
          <Input
            id={passwordId}
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            aria-invalid={fieldErrors.password ? true : undefined}
            className={cn(
              "pl-10",
              fieldErrors.password &&
                "border-[var(--color-danger)] focus-visible:border-[var(--color-danger)] focus-visible:ring-[var(--color-danger)]",
            )}
            aria-describedby={
              [fieldErrors.password ? passwordErrorId : null, state.formError ? formErrorId : null]
                .filter(Boolean)
                .join(" ") || undefined
            }
            onChange={() => {
              if (clientErrors.password) {
                setClientErrors((current) => ({
                  ...current,
                  password: undefined,
                }));
              }
            }}
          />
        </div>
        {fieldErrors.password ? (
          <p id={passwordErrorId} role="alert" className="text-xs text-[var(--color-danger)]">
            {fieldErrors.password}
          </p>
        ) : null}
      </div>

      <div className="rounded-[var(--radius-md)] border border-[var(--color-accent)] bg-[var(--color-warning-soft)] px-4 py-3 text-xs leading-5 text-[var(--color-text-muted)]">
        <div className="flex gap-2">
          <ShieldCheck
            className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]"
            aria-hidden="true"
          />
          <p>
            Supa administrators may use <strong>admin</strong>. Staff usernames use the
            lowercase u-number format.
          </p>
        </div>
      </div>

      <LoginSubmitButton />
    </form>
  );
}

function LoginSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="danger"
      size="lg"
      loading={pending}
      className="w-full"
    >
      <LogIn className="h-4 w-4" aria-hidden="true" />
      {pending ? "Signing in" : "Sign in"}
    </Button>
  );
}
