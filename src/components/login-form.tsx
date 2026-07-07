"use client";

import { useActionState, useId, useState } from "react";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, LockKeyhole, LogIn, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { registerAction } from "@/lib/account-actions";
import { loginAction } from "@/lib/login-actions";
import {
  initialLoginActionState,
  initialRegistrationActionState,
  type LoginFieldErrors,
  type RegistrationFieldErrors,
  validateLoginFields,
  validateRegistrationFields,
} from "@/lib/login-validation";

export function LoginForm() {
  const usernameId = useId();
  const usernameErrorId = useId();
  const passwordId = useId();
  const passwordErrorId = useId();
  const formErrorId = useId();
  const registerUniversityId = useId();
  const registerUniversityErrorId = useId();
  const registerPasswordId = useId();
  const registerPasswordErrorId = useId();
  const registerConfirmPasswordId = useId();
  const registerConfirmPasswordErrorId = useId();
  const registerFormErrorId = useId();
  const [state, formAction] = useActionState(
    loginAction,
    initialLoginActionState,
  );
  const [registrationState, registrationFormAction] = useActionState(
    registerAction,
    initialRegistrationActionState,
  );
  const [clientErrors, setClientErrors] = useState<LoginFieldErrors>({});
  const [registrationClientErrors, setRegistrationClientErrors] =
    useState<RegistrationFieldErrors>({});
  const [showRegistration, setShowRegistration] = useState(false);

  const fieldErrors = {
    ...state.fieldErrors,
    ...clientErrors,
  };
  const registrationFieldErrors = {
    ...registrationState.fieldErrors,
    ...registrationClientErrors,
  };

  return (
    <div className="space-y-5">
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
          <AlertMessage id={formErrorId}>{state.formError}</AlertMessage>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <label htmlFor={usernameId} className="text-sm font-medium text-[var(--color-text)]">
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
          <label htmlFor={passwordId} className="text-sm font-medium text-[var(--color-text)]">
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

        <LoginSubmitButton />

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          aria-expanded={showRegistration}
          onClick={() => setShowRegistration((current) => !current)}
        >
          Create an Account
        </Button>
      </form>

      {showRegistration ? (
        <form
          action={registrationFormAction}
          noValidate
          onSubmit={(event) => {
            const formData = new FormData(event.currentTarget);
            const nextClientErrors = validateRegistrationFields({
              universityId: formData.get("universityId"),
              password: formData.get("password"),
              confirmPassword: formData.get("confirmPassword"),
            });

            setRegistrationClientErrors(nextClientErrors);

            if (
              nextClientErrors.universityId ||
              nextClientErrors.password ||
              nextClientErrors.confirmPassword
            ) {
              event.preventDefault();
            }
          }}
          className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-sunken)] p-4"
        >
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text)]">Create your account</h3>
            <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">
              Use your university ID and a secure password. Your password is hashed before storage.
            </p>
          </div>

          {registrationState.formError ? (
            <AlertMessage id={registerFormErrorId}>{registrationState.formError}</AlertMessage>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <label htmlFor={registerUniversityId} className="text-sm font-medium text-[var(--color-text)]">
              University ID
            </label>
            <Input
              id={registerUniversityId}
              name="universityId"
              autoComplete="username"
              inputMode="text"
              pattern="^u\\d{8}$"
              placeholder="u12345678"
              aria-invalid={registrationFieldErrors.universityId ? true : undefined}
              aria-describedby={registrationFieldErrors.universityId ? registerUniversityErrorId : undefined}
              onChange={() => {
                if (registrationClientErrors.universityId) {
                  setRegistrationClientErrors((current) => ({
                    ...current,
                    universityId: undefined,
                  }));
                }
              }}
            />
            {registrationFieldErrors.universityId ? (
              <p id={registerUniversityErrorId} role="alert" className="text-xs text-[var(--color-danger)]">
                {registrationFieldErrors.universityId}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={registerPasswordId} className="text-sm font-medium text-[var(--color-text)]">
              Password
            </label>
            <Input
              id={registerPasswordId}
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a secure password"
              aria-invalid={registrationFieldErrors.password ? true : undefined}
              aria-describedby={registrationFieldErrors.password ? registerPasswordErrorId : undefined}
              onChange={() => {
                if (registrationClientErrors.password) {
                  setRegistrationClientErrors((current) => ({
                    ...current,
                    password: undefined,
                  }));
                }
              }}
            />
            {registrationFieldErrors.password ? (
              <p id={registerPasswordErrorId} role="alert" className="text-xs text-[var(--color-danger)]">
                {registrationFieldErrors.password}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={registerConfirmPasswordId} className="text-sm font-medium text-[var(--color-text)]">
              Confirm password
            </label>
            <Input
              id={registerConfirmPasswordId}
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Confirm your password"
              aria-invalid={registrationFieldErrors.confirmPassword ? true : undefined}
              aria-describedby={
                [
                  registrationFieldErrors.confirmPassword ? registerConfirmPasswordErrorId : null,
                  registrationState.formError ? registerFormErrorId : null,
                ]
                  .filter(Boolean)
                  .join(" ") || undefined
              }
              onChange={() => {
                if (registrationClientErrors.confirmPassword) {
                  setRegistrationClientErrors((current) => ({
                    ...current,
                    confirmPassword: undefined,
                  }));
                }
              }}
            />
            {registrationFieldErrors.confirmPassword ? (
              <p id={registerConfirmPasswordErrorId} role="alert" className="text-xs text-[var(--color-danger)]">
                {registrationFieldErrors.confirmPassword}
              </p>
            ) : null}
          </div>

          <CreateAccountSubmitButton />
        </form>
      ) : null}
    </div>
  );
}

function AlertMessage({
  id,
  children,
}: Readonly<{
  id: string;
  children: ReactNode;
}>) {
  return (
    <div
      id={id}
      role="alert"
      className="flex gap-3 rounded-[var(--radius-md)] border border-[var(--color-danger)] bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-[var(--color-text)]"
    >
      <AlertCircle
        className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-danger)]"
        aria-hidden="true"
      />
      <span>{children}</span>
    </div>
  );
}

function CreateAccountSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="primary"
      size="lg"
      loading={pending}
      loadingText="Creating account"
      className="w-full"
    >
      Create account
    </Button>
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
      loadingText="Signing in"
      className="w-full"
    >
      <LogIn className="h-4 w-4" aria-hidden="true" />
      Sign in
    </Button>
  );
}
