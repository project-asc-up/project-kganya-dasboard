import "server-only";

import { clerkClient, currentUser } from "@clerk/nextjs/server";
import type { User } from "@clerk/backend";

import { getPrismaClient } from "@/lib/prisma";

export const RBAC_ROLES = ["super_admin", "admin", "user"] as const;
export type RbacRole = (typeof RBAC_ROLES)[number];

export const ROLE_LABELS: Record<RbacRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  user: "User",
};

export const RBAC_PERMISSIONS = [
  "faculty:view",
  "faculty:create",
  "faculty:update",
  "faculty:delete",
  "coach:view",
  "coach:create",
  "coach:update",
  "coach:delete",
  "programme:view",
  "programme:create",
  "programme:update",
  "programme:delete",
  "course-module:view",
  "course-module:create",
  "course-module:update",
  "course-module:delete",
  "resource:view",
  "resource:create",
  "resource:update",
  "resource:delete",
  "faq:view",
  "faq:create",
  "faq:update",
  "faq:delete",
  "system:view",
  "system:refresh",
] as const;

export type RbacPermission = (typeof RBAC_PERMISSIONS)[number];

export const PERMISSION_LABELS: Record<RbacPermission, string> = {
  "faculty:view": "View faculties",
  "faculty:create": "Create faculties",
  "faculty:update": "Edit faculties",
  "faculty:delete": "Delete faculties",
  "coach:view": "View ASC coaches",
  "coach:create": "Create ASC coaches",
  "coach:update": "Edit ASC coaches",
  "coach:delete": "Delete ASC coaches",
  "programme:view": "View programmes",
  "programme:create": "Create programmes",
  "programme:update": "Edit programmes",
  "programme:delete": "Delete programmes",
  "course-module:view": "View course modules",
  "course-module:create": "Create course modules",
  "course-module:update": "Edit course modules",
  "course-module:delete": "Delete course modules",
  "resource:view": "View resources",
  "resource:create": "Create resources",
  "resource:update": "Edit resources",
  "resource:delete": "Delete resources",
  "faq:view": "View FAQs",
  "faq:create": "Create FAQs",
  "faq:update": "Edit FAQs",
  "faq:delete": "Delete FAQs",
  "system:view": "View analytics",
  "system:refresh": "Refresh analytics",
};

export const PERMISSION_GROUPS = [
  {
    label: "Faculties",
    permissions: ["faculty:view", "faculty:create", "faculty:update", "faculty:delete"],
  },
  {
    label: "ASC Coaches",
    permissions: ["coach:view", "coach:create", "coach:update", "coach:delete"],
  },
  {
    label: "Programmes",
    permissions: ["programme:view", "programme:create", "programme:update", "programme:delete"],
  },
  {
    label: "Course Modules",
    permissions: [
      "course-module:view",
      "course-module:create",
      "course-module:update",
      "course-module:delete",
    ],
  },
  {
    label: "Resources",
    permissions: ["resource:view", "resource:create", "resource:update", "resource:delete"],
  },
  {
    label: "FAQs",
    permissions: ["faq:view", "faq:create", "faq:update", "faq:delete"],
  },
  {
    label: "System",
    permissions: ["system:view", "system:refresh"],
  },
] as const satisfies ReadonlyArray<{
  label: string;
  permissions: ReadonlyArray<RbacPermission>;
}>;

export type CurrentAuthorization = {
  userId: string;
  email: string | null;
  role: RbacRole;
  permissions: RbacPermission[];
  isSuperAdmin: boolean;
};

export type ManagedUser = {
  id: string;
  name: string;
  email: string | null;
  username: string | null;
  role: RbacRole;
  roleLabel: string;
  permissions: RbacPermission[];
  createdAt: number;
  lastSignInAt: number | null;
  isCurrentUser: boolean;
};

export type ManagedUserPage = {
  users: ManagedUser[];
  selectedUser: ManagedUser | null;
  query: string;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

function isRbacRole(value: unknown): value is RbacRole {
  return typeof value === "string" && RBAC_ROLES.includes(value as RbacRole);
}

export function normalizeRole(value: unknown): RbacRole {
  return isRbacRole(value) ? value : "user";
}

export function normalizePermissions(value: unknown): RbacPermission[] {
  if (!Array.isArray(value)) return [];

  return value.filter((permission): permission is RbacPermission => {
    return typeof permission === "string" && RBAC_PERMISSIONS.includes(permission as RbacPermission);
  });
}

function bootstrapSuperAdminEmails() {
  return (process.env.RBAC_BOOTSTRAP_SUPER_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function primaryEmailForUser(user: User) {
  const primaryEmail = user.emailAddresses.find(
    (email) => email.id === user.primaryEmailAddressId,
  );

  return primaryEmail?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? null;
}

function isBootstrapSuperAdmin(user: User) {
  const email = primaryEmailForUser(user)?.toLowerCase();
  return Boolean(email && bootstrapSuperAdminEmails().includes(email));
}

function roleForUser(user: User): RbacRole {
  if (isBootstrapSuperAdmin(user)) {
    return "super_admin";
  }

  return normalizeRole(user.publicMetadata?.role);
}

function effectivePermissions(role: RbacRole, metadataPermissions: unknown) {
  if (role === "super_admin") return [...RBAC_PERMISSIONS];
  return normalizePermissions(metadataPermissions);
}

function toManagedUser(user: User, currentUserId: string): ManagedUser {
  const role = roleForUser(user);

  return {
    id: user.id,
    name: [user.firstName, user.lastName].filter(Boolean).join(" ") || "Unnamed user",
    email: primaryEmailForUser(user),
    username: user.username ?? null,
    role,
    roleLabel: ROLE_LABELS[role],
    permissions: effectivePermissions(role, user.publicMetadata?.permissions),
    createdAt: user.createdAt,
    lastSignInAt: user.lastSignInAt,
    isCurrentUser: user.id === currentUserId,
  };
}

export async function getCurrentAuthorization(): Promise<CurrentAuthorization | null> {
  const user = await currentUser();
  if (!user) return null;

  const role = roleForUser(user);
  const email = primaryEmailForUser(user);
  const permissions = effectivePermissions(role, user.publicMetadata?.permissions);

  return {
    userId: user.id,
    email,
    role,
    permissions,
    isSuperAdmin: role === "super_admin",
  };
}

export function canAccess(authz: CurrentAuthorization | null, permission: RbacPermission) {
  if (!authz) return false;
  return authz.isSuperAdmin || authz.permissions.includes(permission);
}

export async function requirePermission(permission: RbacPermission) {
  const authz = await getCurrentAuthorization();

  if (!canAccess(authz, permission)) {
    throw new Error("You do not have permission to perform this action.");
  }

  return authz;
}

export async function requireSuperAdmin() {
  const authz = await getCurrentAuthorization();

  if (!authz?.isSuperAdmin) {
    throw new Error("Only Super Admins can access this area.");
  }

  return authz;
}

export async function getManagedUsers() {
  const page = await getManagedUserPage({ pageSize: 100 });
  return page.users;
}

export async function getManagedUserDetail(userId: string) {
  const authz = await requireSuperAdmin();

  if (!userId) return null;

  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  return toManagedUser(user, authz.userId);
}

export async function getManagedUserPage({
  query = "",
  page = 1,
  pageSize = 10,
  selectedUserId,
}: {
  query?: string;
  page?: number;
  pageSize?: number;
  selectedUserId?: string;
} = {}): Promise<ManagedUserPage> {
  const authz = await requireSuperAdmin();
  const normalizedQuery = query.trim();
  const safePageSize = Math.min(Math.max(pageSize, 1), 50);
  const safePage = Math.max(Number.isFinite(page) ? Math.floor(page) : 1, 1);
  const offset = (safePage - 1) * safePageSize;

  const client = await clerkClient();
  const users = await client.users.getUserList({
    query: normalizedQuery || undefined,
    limit: safePageSize,
    offset,
    orderBy: "-created_at",
  });

  const rows = users.data.map((user) => toManagedUser(user, authz.userId));
  const totalCount = users.totalCount ?? rows.length;
  const totalPages = Math.max(Math.ceil(totalCount / safePageSize), 1);
  const selectedUser =
    selectedUserId
      ? await getManagedUserDetail(selectedUserId)
      : rows[0] ?? null;

  return {
    users: rows,
    selectedUser,
    query: normalizedQuery,
    page: safePage,
    pageSize: safePageSize,
    totalCount,
    totalPages,
    hasPreviousPage: safePage > 1,
    hasNextPage: safePage < totalPages,
  };
}

export async function updateManagedUserAccess(formData: FormData) {
  const authz = await requireSuperAdmin();
  const targetUserId = String(formData.get("userId") ?? "");
  const role = normalizeRole(formData.get("role"));
  const permissions = normalizePermissions(formData.getAll("permissions"));
  const superAdminConfirmation = String(formData.get("superAdminConfirmation") ?? "");

  if (!targetUserId) {
    throw new Error("User ID is required.");
  }

  if (targetUserId === authz.userId) {
    throw new Error("You cannot modify your own role or permissions.");
  }

  const client = await clerkClient();
  const targetUser = await client.users.getUser(targetUserId);
  const previousRole = roleForUser(targetUser);
  const previousPermissions = effectivePermissions(previousRole, targetUser.publicMetadata?.permissions);
  const targetEmail = primaryEmailForUser(targetUser);

  if (isBootstrapSuperAdmin(targetUser) && role !== "super_admin") {
    throw new Error("Bootstrap Super Admin access cannot be revoked from this interface.");
  }

  if (
    previousRole !== role &&
    (previousRole === "super_admin" || role === "super_admin") &&
    superAdminConfirmation !== "confirmed"
  ) {
    throw new Error("Please confirm the Super Admin role change before saving.");
  }

  const newPermissions = effectivePermissions(role, role === "super_admin" ? [] : permissions);

  await client.users.updateUserMetadata(targetUserId, {
    publicMetadata: {
      role,
      permissions: role === "super_admin" ? [] : permissions,
    },
  });

  const prisma = getPrismaClient();
  await prisma.userAccessAuditLog.create({
    data: {
      actorUserId: authz.userId,
      actorEmail: authz.email,
      targetUserId,
      targetEmail,
      previousRole,
      newRole: role,
      previousPermissions,
      newPermissions,
    },
  });
}
