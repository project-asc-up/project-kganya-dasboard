import { getPrismaClient } from "@/lib/prisma";
import { CONFIGURABLE_TABS } from "./tab-access-config";

/**
 * Normalizes an admin pathname for tab matching.
 */
function normalizeTabPathname(pathname: string): string {
  const stripped = pathname.split("?")[0] ?? pathname;
  return stripped === "/" ? "/admin" : stripped.replace(/\/+$/, "") || "/admin";
}

/**
 * Returns a list of all tab hrefs allowed for the given role.
 */
export async function getAllowedTabsForRole(role: string): Promise<string[]> {
  if (role === "super_admin") {
    // Super Admin automatically has unrestricted access to all tabs
    return [
      ...CONFIGURABLE_TABS.map((t) => t.href),
      "/admin/users", // Super Admin only tab
    ];
  }

  const prisma = getPrismaClient();
  const dbAccess = await prisma.roleTabAccess.findMany({
    where: { role },
  });

  const allowedHrefs = new Set<string>();

  // Default allowed tabs for roles
  const defaultAllowed =
    role === "admin"
      ? [
          "/admin",
          "/admin/faculties",
          "/admin/coaches",
          "/admin/programmes",
          "/admin/course-modules",
          "/admin/resources",
          "/admin/faqs",
          "/admin/health",
          "/admin/imports",
        ]
      : [
          "/admin",
          "/admin/faculties",
          "/admin/coaches",
          "/admin/programmes",
          "/admin/course-modules",
          "/admin/resources",
          "/admin/faqs",
        ];

  for (const href of defaultAllowed) {
    allowedHrefs.add(href);
  }

  // Apply DB overrides
  for (const record of dbAccess) {
    if (!CONFIGURABLE_TABS.some((tab) => tab.href === record.tab)) {
      continue;
    }

    if (record.isAllowed) {
      allowedHrefs.add(record.tab);
    } else {
      allowedHrefs.delete(record.tab);
    }
  }

  return Array.from(allowedHrefs);
}

/**
 * Returns a list of all tab hrefs allowed for the given user, overlaying role defaults with user-specific overrides.
 */
export async function getAllowedTabsForUser(userId: string, role: string): Promise<string[]> {
  if (role === "super_admin") {
    // Super Admin automatically has unrestricted access to all tabs
    return [
      ...CONFIGURABLE_TABS.map((t) => t.href),
      "/admin/users", // Super Admin only tab
    ];
  }

  // 1. Get role defaults
  const roleAllowed = await getAllowedTabsForRole(role);
  const allowedHrefs = new Set<string>(roleAllowed);

  // 2. Query user overrides
  const prisma = getPrismaClient();
  const userOverrides = await prisma.userTabAccess.findMany({
    where: { userId },
  });

  // 3. Apply overrides
  for (const record of userOverrides) {
    if (record.isAllowed) {
      allowedHrefs.add(record.tab);
    } else {
      allowedHrefs.delete(record.tab);
    }
  }

  return Array.from(allowedHrefs);
}


/**
 * Checks if a specific pathname is allowed based on the user's allowed tabs.
 */
export function isPathAllowed(pathname: string, allowedTabs: string[] = []): boolean {
  // Always allow profile
  if (pathname === "/admin/profile" || pathname.startsWith("/admin/profile/")) {
    return true;
  }

  const normalized = normalizeTabPathname(pathname);

  // Direct match
  if (allowedTabs.includes(normalized)) {
    return true;
  }

  // Subpath check (e.g. /admin/faculties/123 should be allowed if /admin/faculties is allowed)
  for (const tab of allowedTabs) {
    if (tab !== "/admin" && normalized.startsWith(`${tab}/`)) {
      return true;
    }
  }

  return false;
}
