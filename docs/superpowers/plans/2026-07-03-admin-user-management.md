# Admin User Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a searchable, paginated, Super Admin-only user management interface with Clerk-backed role/permission updates and database audit logging.

**Architecture:** Clerk remains the source of truth for user identity, role, and permission metadata. Prisma stores immutable audit records for every access change. The `/admin/users` page stays a Server Component for search/pagination, with a small Client Component per user editor for confirmations, pending state, and notifications.

**Tech Stack:** Next.js App Router, Clerk `@clerk/nextjs`, Prisma/Postgres, Server Actions, Node test runner with `tsx`.

---

### Task 1: Regression Tests

**Files:**
- Modify: `tests/rbac-source.test.ts`

- [ ] Add assertions for searchable/paginated user management, audit logging, self-protection, confirmation UI, and action-state notifications.
- [ ] Run `node --test --import tsx tests/rbac-source.test.ts` and verify the new assertions fail before production code changes.

### Task 2: Audit Persistence

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/0004_user_access_audit/migration.sql`

- [ ] Add `UserAccessAuditLog` with actor/target identity, previous/new role, previous/new permissions JSON, and timestamp.
- [ ] Generate Prisma client after schema change.

### Task 3: RBAC Search And Update Helpers

**Files:**
- Modify: `src/lib/rbac.ts`
- Modify: `src/lib/user-management-actions.ts`

- [ ] Add search params support for Clerk user lookup by query, page, and selected user ID.
- [ ] Add normalized user view models that include username and effective permissions.
- [ ] Update role/permission mutation to validate confirmation intent, block self-modification, persist Clerk metadata, and create audit rows.
- [ ] Return structured action results for success/failure notifications.

### Task 4: Admin User Interface

**Files:**
- Modify: `src/app/admin/users/page.tsx`
- Create: `src/components/user-access-editor.tsx`

- [ ] Render search input, pagination links, result summary, selected user profile details, role selector, grouped permission checkboxes, and audit-aware warnings.
- [ ] Add client-side confirmation prompts for granting/revoking Super Admin.
- [ ] Add loading, success, and error states with `useActionState` and `useFormStatus`.

### Task 5: Verification

**Files:**
- Modify: `tests/rbac-source.test.ts`

- [ ] Run focused RBAC test.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Run existing UI regression suite.
