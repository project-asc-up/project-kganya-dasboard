"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

import { initialUserAccessActionState, updateUserAccess } from "@/lib/user-management-actions";

type UserAccessEditorUser = {
  id: string;
  name: string;
  email: string | null;
  username: string | null;
  role: string;
  roleLabel: string;
  isCurrentUser: boolean;
};

type UserAccessEditorProps = {
  user: UserAccessEditorUser;
  roles: Array<{ value: string; label: string }>;
};

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="inline-flex items-center justify-center rounded-full bg-[var(--color-brand)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Saving role..." : "Save role"}
    </button>
  );
}

export function UserAccessEditor({ user, roles }: UserAccessEditorProps) {
  const [state, formAction] = useActionState(updateUserAccess, initialUserAccessActionState);
  const confirmationRef = useRef<HTMLInputElement>(null);
  const disabled = user.isCurrentUser;

  useEffect(() => {
    if (confirmationRef.current) {
      confirmationRef.current.value = "";
    }
  }, [user.id]);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        const formData = new FormData(event.currentTarget);
        const nextRole = String(formData.get("role") ?? "");
        const isSuperAdminChange =
          nextRole !== user.role && (nextRole === "super_admin" || user.role === "super_admin");

        if (isSuperAdminChange) {
          const confirmed = confirm(
            nextRole === "super_admin"
              ? "Grant Super Admin access to this user? They will be able to create users and manage all content."
              : "Revoke Super Admin access from this user? They will lose user-management privileges.",
          );

          if (!confirmed) {
            event.preventDefault();
            return;
          }

          if (confirmationRef.current) {
            confirmationRef.current.value = "confirmed";
          }
        }
      }}
      className="space-y-6"
    >
      <input type="hidden" name="userId" value={user.id} />
      <input ref={confirmationRef} type="hidden" name="superAdminConfirmation" value="" />

      {state.status !== "idle" ? (
        <div
          className={[
            "rounded-2xl border px-4 py-3 text-sm font-medium",
            state.status === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800",
          ].join(" ")}
          role="status"
        >
          {state.message}
        </div>
      ) : null}

      {disabled ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
          You cannot modify your own role from this screen. Ask another Super Admin to make changes if needed.
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">{user.name}</h2>
            <span className="rounded-full bg-[var(--color-brand-soft)] px-3 py-1 text-xs font-semibold text-[var(--color-brand-soft-foreground)]">
              {user.roleLabel}
            </span>
          </div>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-[var(--color-text)]">Email</dt>
              <dd className="mt-1 text-[var(--color-text-muted)]">{user.email ?? "No primary email"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--color-text)]">Username</dt>
              <dd className="mt-1 text-[var(--color-text-muted)]">{user.username ?? "No username"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-semibold text-[var(--color-text)]">Clerk user ID</dt>
              <dd className="mt-1 break-all font-mono text-xs text-[var(--color-text-muted)]">{user.id}</dd>
            </div>
          </dl>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-[var(--color-text)]">Role</span>
          <select
            name="role"
            defaultValue={user.role}
            disabled={disabled}
            className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text)] shadow-sm outline-none transition focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-ring)]/25 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
          <span className="block text-xs leading-5 text-[var(--color-text-muted)]">
            Role decides access. User is view only, Admin is view plus edit, and Super Admin can create users and manage everything.
          </span>
        </label>
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm leading-6 text-[var(--color-text-muted)]">
        Current effective access:{" "}
        <strong className="text-[var(--color-text)]">
          {user.role === "super_admin" ? "view, edit, and create users" : user.role === "admin" ? "view and edit" : "view only"}
        </strong>
      </div>

      <div className="flex justify-end">
        <SubmitButton disabled={disabled} />
      </div>
    </form>
  );
}
