"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ActionButton } from "@/components/admin-form";
import { saveTabAccessAction } from "@/lib/tab-access-actions";
import { CONFIGURABLE_TABS } from "@/lib/tab-access-config";

type TabAccessEditorProps = {
  adminAllowed: string[];
  userAllowed: string[];
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <ActionButton
      type="submit"
      loading={pending}
      loadingText="Saving permissions..."
    >
      Save permissions
    </ActionButton>
  );
}

export function TabAccessEditor({ adminAllowed, userAllowed }: TabAccessEditorProps) {
  const [state, formAction] = useActionState(saveTabAccessAction, { status: "idle" as const, message: "" });

  return (
    <form action={formAction} className="space-y-6">
      {state.status !== "idle" ? (
        <div
          className={[
            "rounded-2xl border px-4 py-3 text-sm font-medium transition duration-200",
            state.status === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800",
          ].join(" ")}
          role="status"
        >
          {state.message}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
        <table className="w-full border-collapse text-left text-sm text-[var(--color-text)]">
          <thead className="bg-[var(--color-surface-sunken)] border-b border-[var(--color-border)]">
            <tr>
              <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
                Tab Name / Section
              </th>
              <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-[var(--color-text-muted)] text-center w-40">
                User Role
              </th>
              <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-[var(--color-text-muted)] text-center w-40">
                Admin Role
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {CONFIGURABLE_TABS.map((tab) => (
              <tr
                key={tab.href}
                className="hover:bg-[var(--color-surface-sunken)]/40 transition-colors duration-100 ease-out"
              >
                <td className="px-6 py-4">
                  <div className="font-semibold text-sm text-[var(--color-text)]">{tab.label}</div>
                  <div className="text-xs text-[var(--color-text-muted)] font-mono mt-0.5">
                    {tab.href}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <label className="inline-flex items-center justify-center p-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="user-tabs"
                      value={tab.href}
                      defaultChecked={userAllowed.includes(tab.href)}
                      className="h-5 w-5 rounded border-[var(--color-border)] bg-white text-[var(--color-brand)] accent-[var(--color-brand)] focus:ring-[var(--color-ring)] focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="sr-only">Allow {tab.label} for User</span>
                  </label>
                </td>
                <td className="px-6 py-4 text-center">
                  <label className="inline-flex items-center justify-center p-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="admin-tabs"
                      value={tab.href}
                      defaultChecked={adminAllowed.includes(tab.href)}
                      className="h-5 w-5 rounded border-[var(--color-border)] bg-white text-[var(--color-brand)] accent-[var(--color-brand)] focus:ring-[var(--color-ring)] focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="sr-only">Allow {tab.label} for Admin</span>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
