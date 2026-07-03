import { PageHeader, Section, Select } from "@/components/admin-form";
import { updateUserAccess } from "@/lib/user-management-actions";
import {
  getManagedUsers,
  PERMISSION_LABELS,
  RBAC_PERMISSIONS,
  RBAC_ROLES,
  ROLE_LABELS,
} from "@/lib/rbac";

function formatDate(value: number | null | undefined) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function UserManagementPage() {
  const users = await getManagedUsers();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Super Admin"
        title="User access management"
        description="Grant or revoke platform roles and content-management permissions for Clerk-authenticated users."
      />

      <Section
        title="Role and permission assignments"
        description="Super Admins always have unrestricted access. Admins and Users can only create, edit, or delete content when explicit permissions are assigned."
      >
        <div className="space-y-4">
          {users.map((user) => (
            <form
              key={user.id}
              action={updateUserAccess}
              className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-card)]"
            >
              <input type="hidden" name="userId" value={user.id} />

              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_16rem]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-[var(--color-text)]">
                      {user.name}
                    </h2>
                    <span className="rounded-full bg-[var(--color-brand-soft)] px-3 py-1 text-xs font-semibold text-[var(--color-brand-soft-foreground)]">
                      {user.roleLabel}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    {user.email ?? "No primary email"} | Created {formatDate(user.createdAt)} | Last sign-in{" "}
                    {formatDate(user.lastSignInAt)}
                  </p>
                </div>

                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-[var(--color-text)]">
                    Role
                  </span>
                  <Select name="role" defaultValue={user.role}>
                    {RBAC_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {ROLE_LABELS[role]}
                      </option>
                    ))}
                  </Select>
                </label>
              </div>

              <fieldset className="mt-5">
                <legend className="text-sm font-semibold text-[var(--color-text)]">
                  Explicit permissions
                </legend>
                <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">
                  Admins and Users only receive the permissions selected here. Super Admins do not need explicit permissions.
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {RBAC_PERMISSIONS.map((permission) => (
                    <label
                      key={permission}
                      className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)]"
                    >
                      <input
                        type="checkbox"
                        name="permissions"
                        value={permission}
                        defaultChecked={user.permissions.includes(permission)}
                        className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-brand)]"
                      />
                      {PERMISSION_LABELS[permission]}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="mt-5 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-[var(--color-brand)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2"
                >
                  Save access
                </button>
              </div>
            </form>
          ))}
        </div>
      </Section>
    </div>
  );
}
