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
  assert.match(source, /targetUserId === authz\.userId/);
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

test("super admin user management supports search, pagination, confirmations, and notifications", () => {
  const page = readSource("src/app/admin/users/page.tsx");
  const editorExists = existsSync(join(root, "src/components/user-access-editor.tsx"));

  assert.equal(editorExists, true);
  assert.match(page, /searchParams/);
  assert.match(page, /getManagedUserPage/);
  assert.match(page, /query/);
  assert.match(page, /page/);
  assert.match(page, /selectedUserId/);
  assert.match(page, /UserAccessEditor/);

  const editor = readSource("src/components/user-access-editor.tsx");
  assert.match(editor, /useActionState/);
  assert.match(editor, /useFormStatus/);
  assert.match(editor, /confirm\(/);
  assert.match(editor, /Super Admin/);
  assert.match(editor, /success/);
  assert.match(editor, /error/);
});

test("role updates are audited and prevent users from editing their own access", () => {
  const rbac = readSource("src/lib/rbac.ts");
  const action = readSource("src/lib/user-management-actions.ts");
  const schema = readSource("prisma/schema.prisma");

  assert.match(rbac, /getManagedUserPage/);
  assert.match(rbac, /getManagedUserDetail/);
  assert.match(rbac, /actorUserId/);
  assert.match(rbac, /targetUserId === authz\.userId/);
  assert.match(rbac, /userAccessAuditLog\.create/);
  assert.match(rbac, /previousPermissions/);
  assert.match(rbac, /newPermissions/);
  assert.match(action, /type UserAccessActionState/);
  assert.match(action, /return\s+\{\s+status: "success"/);
  assert.match(action, /return\s+\{\s+status: "error"/);
  assert.match(schema, /model UserAccessAuditLog/);
  assert.match(schema, /@@map\("user_access_audit_logs"\)/);
});
