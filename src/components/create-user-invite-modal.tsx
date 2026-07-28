"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { ActionButton, CreateButton, Field, Select, TextInput } from "@/components/admin-form";
import { Modal } from "@/components/modal";
import { createUserInvitation } from "@/lib/user-management-actions";
import { initialUserInviteActionState, type UserAccessActionState } from "@/lib/user-management-types";

type RoleOption = {
  value: string;
  label: string;
};

type CreateUserInviteModalProps = {
  roles: RoleOption[];
};

export function CreateUserInviteModal({ roles }: CreateUserInviteModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<UserAccessActionState>(initialUserInviteActionState);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true);
      setFeedback(initialUserInviteActionState);
      const result = await createUserInvitation(feedback, formData);
      setIsSubmitting(false);
      if (result.status === "success") {
        setShowSuccess(true);
        setIsOpen(false);
        router.refresh();
        setTimeout(() => {
          setShowSuccess(false);
        }, 4000);
      } else {
        setFeedback(result);
      }
    } catch (error) {
      setIsSubmitting(false);
      setFeedback({
        status: "error",
        message: error instanceof Error ? error.message : "Unable to create the user invitation.",
      });
    }
  };

  const handleClose = () => {
    setFeedback(initialUserInviteActionState);
    setIsOpen(false);
  };

  return (
    <>
      <CreateButton onClick={() => setIsOpen(true)}>Invite User</CreateButton>

      {showSuccess && (
        <div className="fixed bottom-4 right-4 z-[9999] flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-lg transition-all animate-in fade-in slide-in-from-bottom-2 duration-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <span>Invitation sent successfully.</span>
        </div>
      )}

      <Modal isOpen={isOpen} onClose={handleClose} title="Invite New User" size="md">
        <form action={handleSubmit} className="space-y-5">
          {feedback.status !== "idle" ? (
            <div
              className={[
                "rounded-2xl border px-4 py-3 text-sm font-medium",
                feedback.status === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-rose-200 bg-rose-50 text-rose-800",
              ].join(" ")}
              role="status"
            >
              {feedback.message}
            </div>
          ) : null}

          <Field label="Email address" hint="*Required">
            <TextInput name="email" type="email" required placeholder="name@example.com" />
          </Field>

          <Field label="Role" hint="*Required">
            <Select name="role" defaultValue="user" required>
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </Select>
          </Field>

          <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-light)] px-4 py-3 text-sm leading-6 text-[color:var(--color-text-muted)]">
            Role rules are fixed:
            <div className="mt-2 space-y-1">
              <div>
                <strong>User:</strong> view only
              </div>
              <div>
                <strong>Admin:</strong> view and edit
              </div>
              <div>
                <strong>Super Admin:</strong> view, edit, and create users
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[color:var(--color-border)]">
            <ActionButton
              type="button"
              tone="secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </ActionButton>
            <ActionButton
              type="submit"
              loading={isSubmitting}
              loadingText="Inviting..."
            >
              Invite User
            </ActionButton>
          </div>
        </form>
      </Modal>
    </>
  );
}
