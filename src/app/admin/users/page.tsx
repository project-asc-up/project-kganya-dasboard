import Link from "next/link";

import { PageHeader, Section, TextInput } from "@/components/admin-form";
import { CreateUserInviteModal } from "@/components/create-user-invite-modal";
import { UserAccessEditor } from "@/components/user-access-editor";
import { TabAccessEditor } from "@/components/tab-access-editor";
import { UserSearchAccordion } from "@/components/user-search-accordion";
import { getManagedUserPage, RBAC_ROLES, ROLE_LABELS, getCurrentAuthorization } from "@/lib/rbac";
import { getAllowedTabsForRole } from "@/lib/tab-access";

export const dynamic = "force-dynamic";

type UserManagementSearchParams = Promise<{
  q?: string | string[];
  page?: string | string[];
  user?: string | string[];
}>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function pageHref({
  query,
  page,
  selectedUserId,
}: {
  query: string;
  page: number;
  selectedUserId?: string | null;
}) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (page > 1) params.set("page", String(page));
  if (selectedUserId) params.set("user", selectedUserId);
  const suffix = params.toString();
  return suffix ? `/admin/users?${suffix}` : "/admin/users";
}

function formatDate(value: number | null | undefined) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function UserManagementPage({
  searchParams,
}: {
  searchParams: UserManagementSearchParams;
}) {
  const params = await searchParams;
  const query = firstParam(params.q)?.trim() ?? "";
  const page = Number(firstParam(params.page) ?? "1");
  const selectedUserId = firstParam(params.user);
  const userPage = await getManagedUserPage({
    query,
    page: Number.isFinite(page) ? page : 1,
    selectedUserId,
  });
  const roleOptions = RBAC_ROLES.map((role) => ({
    value: role,
    label: ROLE_LABELS[role],
  }));

  const authz = await getCurrentAuthorization();
  const canManageTabAccess = authz && (authz.role === "admin" || authz.role === "super_admin");
  const adminAllowed = canManageTabAccess ? await getAllowedTabsForRole("admin") : [];
  const userAllowed = canManageTabAccess ? await getAllowedTabsForRole("user") : [];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Super Admin"
        title="User access management"
        description="Search registered Clerk users, review profile details, and grant or revoke role-based access with an audit trail."
        action={<CreateUserInviteModal roles={roleOptions} />}
      />

      <Section
        title="Find a user"
        description="Search by name, email address, or username. Results are loaded server-side for scalability."
      >
        <UserSearchAccordion defaultExpanded={!!userPage.query || !!userPage.selectedUserId}>
          <form className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]" action="/admin/users">
            <TextInput
              type="search"
              name="q"
              defaultValue={userPage.query}
              placeholder="Search by name, email, or username..."
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-brand)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2"
            >
              Search users
            </button>
          </form>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--color-text-muted)]">
            <span>
              Showing page {userPage.page} of {userPage.totalPages} for {userPage.totalCount} user
              {userPage.totalCount === 1 ? "" : "s"}.
            </span>
            {userPage.query ? (
              <Link
                href="/admin/users"
                className="font-semibold text-[var(--color-brand)] transition hover:text-[var(--color-brand-strong)]"
              >
                Clear search
              </Link>
            ) : null}
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.2fr)]">
            <div className="space-y-3">
              {userPage.users.length > 0 ? (
                userPage.users.map((user) => {
                  const href = pageHref({
                    query: userPage.query,
                    page: userPage.page,
                    selectedUserId: user.id,
                  });
                  const isSelected = userPage.selectedUser?.id === user.id;

                  return (
                    <Link
                      key={user.id}
                      href={href}
                      aria-current={isSelected ? "true" : undefined}
                      className={[
                        "block rounded-2xl border p-4 transition",
                        isSelected
                          ? "border-[var(--color-brand)] bg-[var(--color-brand-soft)]"
                          : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-brand)]",
                      ].join(" ")}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold text-[var(--color-text)]">{user.name}</h2>
                        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[var(--color-brand-soft-foreground)]">
                          {user.roleLabel}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm text-[var(--color-text-muted)]">
                        {user.email ?? user.username ?? user.id}
                      </p>
                      <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                        Last sign-in: {formatDate(user.lastSignInAt)}
                      </p>
                    </Link>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-sm text-[var(--color-text-muted)]">
                  No users matched this search.
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-2">
                <Link
                  href={pageHref({
                    query: userPage.query,
                    page: Math.max(userPage.page - 1, 1),
                    selectedUserId: userPage.selectedUser?.id,
                  })}
                  aria-disabled={!userPage.hasPreviousPage}
                  className={[
                    "rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-semibold transition",
                    userPage.hasPreviousPage
                      ? "text-[var(--color-brand)] hover:border-[var(--color-brand)]"
                      : "pointer-events-none text-[var(--color-text-muted)] opacity-50",
                  ].join(" ")}
                >
                  Previous
                </Link>
                <Link
                  href={pageHref({
                    query: userPage.query,
                    page: userPage.page + 1,
                    selectedUserId: userPage.selectedUser?.id,
                  })}
                  aria-disabled={!userPage.hasNextPage}
                  className={[
                    "rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-semibold transition",
                    userPage.hasNextPage
                      ? "text-[var(--color-brand)] hover:border-[var(--color-brand)]"
                      : "pointer-events-none text-[var(--color-text-muted)] opacity-50",
                  ].join(" ")}
                >
                  Next
                </Link>
              </div>
            </div>

            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-card)]">
              {userPage.selectedUser ? (
                <UserAccessEditor
                  key={userPage.selectedUser.id}
                  user={userPage.selectedUser}
                  roles={roleOptions}
                />
              ) : (
                <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-sm leading-6 text-[var(--color-text-muted)]">
                  Search for a registered user, then select a result to manage their role.
                </div>
              )}
            </div>
          </div>
        </UserSearchAccordion>
      </Section>

      {canManageTabAccess ? (
        <Section
          title="Role-based access control"
          description="Select which tabs are visible and accessible to Users and Admins. Super Admins always retain unrestricted access and do not require manual configuration."
        >
          <TabAccessEditor adminAllowed={adminAllowed} userAllowed={userAllowed} />
        </Section>
      ) : null}
    </div>
  );
}
