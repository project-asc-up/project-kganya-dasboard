"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

import { ActionButton } from "@/components/admin-form";
import { Button } from "@/components/ui/button";
import {
  updateUserAccess,
  suspendUserAction,
  unsuspendUserAction,
  banUserAction,
  unbanUserAction,
} from "@/lib/user-management-actions";
import { initialUserAccessActionState } from "@/lib/user-management-types";

type UserAccessEditorUser = {
  id: string;
  name: string;
  email: string | null;
  username: string | null;
  role: string;
  roleLabel: string;
  isCurrentUser: boolean;
  isSuspended: boolean;
  isBanned: boolean;
  suspensionReason: string | null;
  banReason: string | null;
};

type UserAccessEditorProps = {
  user: UserAccessEditorUser;
  roles: Array<{ value: string; label: string }>;
  isSuperAdmin?: boolean;
};

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <ActionButton
      type="submit"
      disabled={disabled}
      loading={pending}
      loadingText="Saving role..."
    >
      Save role
    </ActionButton>
  );
}

function ModerationSubmitButton({ label, loadingLabel }: { label: string; loadingLabel: string }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="primary"
      size="sm"
      disabled={pending}
      className="inline-flex items-center gap-2"
    >
      {pending && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      <span>{pending ? loadingLabel : label}</span>
    </Button>
  );
}

export function UserAccessEditor({ user, roles, isSuperAdmin = false }: UserAccessEditorProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(updateUserAccess, initialUserAccessActionState);
  
  const [suspendState, suspendAction] = useActionState(suspendUserAction, initialUserAccessActionState);
  const [unsuspendState, unsuspendAction] = useActionState(unsuspendUserAction, initialUserAccessActionState);
  const [banState, banAction] = useActionState(banUserAction, initialUserAccessActionState);
  const [unbanState, unbanAction] = useActionState(unbanUserAction, initialUserAccessActionState);

  const [activeAction, setActiveAction] = useState<"suspend" | "ban" | "unsuspend" | "unban" | null>(null);
  const [reason, setReason] = useState("");

  const confirmationRef = useRef<HTMLInputElement>(null);
  const disabled = user.isCurrentUser;

  useEffect(() => {
    if (confirmationRef.current) {
      confirmationRef.current.value = "";
    }
    setActiveAction(null);
    setReason("");
  }, [user.id]);

  // Watch suspendState for success
  useEffect(() => {
    if (suspendState.status === "success") {
      router.refresh();
      setActiveAction(null);
      setReason("");
    }
  }, [suspendState, router]);

  // Watch unsuspendState for success
  useEffect(() => {
    if (unsuspendState.status === "success") {
      router.refresh();
      setActiveAction(null);
      setReason("");
    }
  }, [unsuspendState, router]);

  // Watch banState for success
  useEffect(() => {
    if (banState.status === "success") {
      router.refresh();
      setActiveAction(null);
      setReason("");
    }
  }, [banState, router]);

  // Watch unbanState for success
  useEffect(() => {
    if (unbanState.status === "success") {
      router.refresh();
      setActiveAction(null);
      setReason("");
    }
  }, [unbanState, router]);

  const moderationState = 
    suspendState.status !== "idle" ? suspendState :
    unsuspendState.status !== "idle" ? unsuspendState :
    banState.status !== "idle" ? banState :
    unbanState.status !== "idle" ? unbanState : null;

  return (
    <div className="space-y-6">
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

      {/* Moderation Controls - Restricted to Super Admins only */}
      {isSuperAdmin && (
        <div className="mt-6 border-t border-[var(--color-border)] pt-6 space-y-4 animate-slide-up">
          <h3 className="text-lg font-semibold text-[var(--color-text)]">User moderation actions</h3>

          {moderationState && (
            <div
              className={[
                "rounded-2xl border px-4 py-3 text-sm font-medium animate-slide-up",
                moderationState.status === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-rose-200 bg-rose-50 text-rose-800",
              ].join(" ")}
              role="status"
            >
              {moderationState.message}
            </div>
          )}

          {user.isCurrentUser ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
              You cannot perform moderation actions on yourself.
            </div>
          ) : (
            <div className="space-y-4">
              {user.isBanned && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 space-y-3">
                  <div className="space-y-1">
                    <p className="font-semibold">This user is permanently banned.</p>
                    <p className="text-xs">Reason: {user.banReason || "No reason provided."}</p>
                  </div>
                  
                  {activeAction !== "unban" ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActiveAction("unban");
                        setReason("");
                      }}
                    >
                      Unban User
                    </Button>
                  ) : (
                    <form
                      action={unbanAction}
                      className="space-y-3 pt-2 border-t border-rose-200/50 animate-slide-up"
                    >
                      <input type="hidden" name="userId" value={user.id} />
                      <label className="block space-y-2">
                        <span className="text-xs font-semibold text-rose-900">Administrative note (optional)</span>
                        <input
                          type="text"
                          name="reason"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="Provide an optional administrative note..."
                          className="w-full rounded-xl border border-rose-300 bg-white px-3 py-2 text-xs text-rose-950 outline-none"
                        />
                      </label>
                      <div className="flex gap-2">
                        <ModerationSubmitButton label="Confirm Unban" loadingLabel="Unbanning..." />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveAction(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {user.isSuspended && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 space-y-3">
                  <div className="space-y-1">
                    <p className="font-semibold">This user is currently suspended.</p>
                    <p className="text-xs">Reason: {user.suspensionReason || "No reason provided."}</p>
                  </div>
                  
                  {activeAction !== "unsuspend" ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActiveAction("unsuspend");
                        setReason("");
                      }}
                    >
                      Unsuspend User
                    </Button>
                  ) : (
                    <form
                      action={unsuspendAction}
                      className="space-y-3 pt-2 border-t border-amber-200/50 animate-slide-up"
                    >
                      <input type="hidden" name="userId" value={user.id} />
                      <label className="block space-y-2">
                        <span className="text-xs font-semibold text-amber-900">Administrative note (optional)</span>
                        <input
                          type="text"
                          name="reason"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="Provide an optional administrative note..."
                          className="w-full rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs text-amber-950 outline-none"
                        />
                      </label>
                      <div className="flex gap-2">
                        <ModerationSubmitButton label="Confirm Unsuspend" loadingLabel="Unsuspending..." />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveAction(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {!user.isBanned && !user.isSuspended && (
                <div className="space-y-4">
                  {activeAction === null ? (
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setActiveAction("suspend");
                          setReason("");
                        }}
                      >
                        Suspend User
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setActiveAction("ban");
                          setReason("");
                        }}
                      >
                        Ban User
                      </Button>
                    </div>
                  ) : (
                    <form
                      action={activeAction === "suspend" ? suspendAction : banAction}
                      className="space-y-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 animate-slide-up"
                    >
                      <input type="hidden" name="userId" value={user.id} />
                      <label className="block space-y-2">
                        <span className="text-sm font-semibold text-[var(--color-text)]">
                          Reason for {activeAction === "suspend" ? "suspension" : "permanent ban"} *
                        </span>
                        <input
                          type="text"
                          name="reason"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          required
                          placeholder={`Provide a mandatory reason for the ${activeAction}...`}
                          className="w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-brand)]"
                        />
                      </label>
                      <div className="flex gap-2 pt-2">
                        <ModerationSubmitButton
                          label={activeAction === "suspend" ? "Confirm Suspension" : "Confirm Ban"}
                          loadingLabel={activeAction === "suspend" ? "Suspending..." : "Banning..."}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveAction(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
