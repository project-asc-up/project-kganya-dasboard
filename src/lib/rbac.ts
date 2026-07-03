import "server-only";

import { clerkClient, currentUser } from "@clerk/nextjs/server";
import type { User } from "@clerk/backend";

export const RBAC_ROLES = ["super_admin", "admin", "user"] as const;
export type RbacRole = (typeof RBAC_ROLES)[number];

export const ROLE_LABELS: Record<RbacRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  user: "User",
};

export const RBAC_PERMISSIONS = [
  "faculty:create",
  "faculty:update",
  "faculty:delete",
  "coach:create",
  "coach:update",
  "coach:delete",
  "programme:create",
  "programme:update",
  "programme:delete",
  "course-module:create",
  "course-module:update",
  "course-module:delete",
  "resource:create",
  "resource:update",
  "resource:delete",
  "faq:create",
  "faq:update",
  "faq:delete",
  "system:refresh",
] as const;

export type RbacPermission = (typeof RBAC_PERMISSIONS)[number];

export const PERMISSION_LABELS: Record<RbacPermission, string> = {
  "faculty:create": "Create faculties",
  "faculty:update": "Edit faculties",
  "faculty:delete": "Delete faculties",
  "coach:create": "Create ASC coaches",
  "coach:update": "Edit ASC coaches",
  "coach:delete": "Delete ASC coaches",
  "programme:create": "Create programmes",
  "programme:update": "Edit programmes",
  "programme:delete": "Delete programmes",
  "course-module:create": "Create course modules",
  "course-module:update": "Edit course modules",
  "course-module:delete": "Delete course modules",
  "resource:create": "Create resources",
  "resource:update": "Edit resources",
  "resource:delete": "Delete resources",
  "faq:create": "Create FAQs",
  "faq:update": "Edit FAQs",
  "faq:delete": "Delete FAQs",
  "system:refresh": "Refresh analytics",
};

export type CurrentAuthorization = {
  userId: string;
  email: string | null;
  role: RbacRole;
  permissions: RbacPermission[];
  isSuperAdmin: boolean;
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

function roleForUser(user: User): RbacRole {
  const email = primaryEmailForUser(user)?.toLowerCase();
  if (email && bootstrapSuperAdminEmails().includes(email)) {
    return "super_admin";
  }

  return normalizeRole(user.publicMetadata?.role);
}

function effectivePermissions(role: RbacRole, metadataPermissions: unknown) {
  if (role === "super_admin") return [...RBAC_PERMISSIONS];
  return normalizePermissions(metadataPermissions);
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
  await requireSuperAdmin();

  const client = await clerkClient();
  const users = await client.users.getUserList({
    limit: 100,
    orderBy: "-created_at",
  });

  return users.data.map((user) => {
    const role = roleForUser(user);
    return {
      id: user.id,
      name: [user.firstName, user.lastName].filter(Boolean).join(" ") || "Unnamed user",
      email: primaryEmailForUser(user),
      role,
      roleLabel: ROLE_LABELS[role],
      permissions: effectivePermissions(role, user.publicMetadata?.permissions),
      createdAt: user.createdAt,
      lastSignInAt: user.lastSignInAt,
    };
  });
}

export async function updateManagedUserAccess(formData: FormData) {
  const authz = await requireSuperAdmin();
  const targetUserId = String(formData.get("userId") ?? "");
  const role = normalizeRole(formData.get("role"));
  const permissions = normalizePermissions(formData.getAll("permissions"));

  if (!targetUserId) {
    throw new Error("User ID is required.");
  }

  if (targetUserId === authz.userId && role !== "super_admin") {
    throw new Error("You cannot remove your own Super Admin role.");
  }

  const client = await clerkClient();
  await client.users.updateUserMetadata(targetUserId, {
    publicMetadata: {
      role,
      permissions: role === "super_admin" ? [] : permissions,
    },
  });
}
