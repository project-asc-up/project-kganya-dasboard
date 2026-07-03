import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function readSource(path: string) {
  return readFileSync(join(root, path), "utf8");
}

test("RBAC uses Clerk metadata, bootstrap super admins, and explicit permissions", () => {
  const source = readSource("src/lib/rbac.ts");

  assert.match(source, /RBAC_BOOTSTRAP_SUPER_ADMIN_EMAILS/);
  assert.match(source, /publicMetadata\?\.role/);
  assert.match(source, /publicMetadata\?\.permissions/);
  assert.match(source, /updateUserMetadata/);
  assert.match(source, /targetUserId === authz\.userId && role !== "super_admin"/);
  assert.match(source, /if \(role === "super_admin"\) return \[\.\.\.RBAC_PERMISSIONS\]/);
  assert.doesNotMatch(source, /DEFAULT_ADMIN_PERMISSIONS/);
});

test("all admin mutations are protected by server-side permission checks", () => {
  const source = readSource("src/lib/admin-actions.ts");
  const permissions = [
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
  ];

  for (const permission of permissions) {
    assert.match(source, new RegExp(`requirePermission\\("${permission}"\\)`), permission);
  }
});

test("super admin navigation and Clerk profile controls are wired into the admin shell", () => {
  const shell = readSource("src/components/admin-shell.tsx");
  const sidebar = readSource("src/components/admin-sidebar-nav.tsx");
  const profileMenu = readSource("src/components/admin-profile-menu.tsx");

  assert.match(shell, /getCurrentAuthorization/);
  assert.match(shell, /canManageUsers=\{authz\?\.isSuperAdmin \?\? false\}/);
  assert.match(shell, /<AdminProfileMenu \/>/);
  assert.match(sidebar, /canManageUsers/);
  assert.match(sidebar, /href: "\/admin\/users"/);
  assert.match(profileMenu, /label="Edit Profile"/);
  assert.match(profileMenu, /label="signOut"/);
});

test("Clerk profile page uses a catch-all route for nested profile screens", () => {
  assert.equal(
    existsSync(join(root, "src/app/admin/profile/[[...user-profile]]/page.tsx")),
    true,
  );
});
