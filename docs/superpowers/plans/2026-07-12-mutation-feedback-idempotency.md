# Mutation Feedback and Idempotency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every admin mutation visibly track persistence and chatbot synchronization, prevent duplicate writes, and convert exact duplicate creates into updates.

**Architecture:** Add a request-receipt table keyed by client request id, domain identity helpers for upsert semantics, and structured server-action results. A shared client mutation controller renders centered blurred modals and polls Dify job state until `synced`, while delete uses a stronger confirmation state. Existing authorization, cache invalidation, and Dify worker boundaries remain in place.

**Tech Stack:** Next.js 16 App Router server actions, React 19 client components, Prisma 7/PostgreSQL, Neon, Node test runner with `tsx`.

---

## File map

- Create `src/lib/mutation-types.ts`: shared mutation result and lifecycle types.
- Create `src/lib/mutation-receipts.ts`: request-id validation, receipt lookup, and exactly-once execution wrapper.
- Create `src/lib/mutation-identities.ts`: normalized FAQ identity and domain key helpers.
- Create `src/components/mutation-feedback-modal.tsx`: centered modal lifecycle UI.
- Create `src/components/mutation-form.tsx`: client form bridge that generates request ids, disables duplicate submits, and invokes server actions.
- Create `src/app/api/admin/mutations/[mutationId]/route.ts`: authenticated sync-status endpoint.
- Create `prisma/migrations/0007_mutation_receipts/migration.sql`: durable request receipt storage and unique request key.
- Modify `prisma/schema.prisma`: add `MutationReceipt` model.
- Modify `src/lib/admin-actions.ts`: return structured results, wrap writes in request receipts, upsert duplicate creates, and enqueue one sync job.
- Modify `src/lib/dify-sync.ts`: expose job status and deduplicate pending sync jobs by source/action/content identity.
- Modify all create modals under `src/components/create-*.tsx`: use the shared mutation form/modal.
- Modify detail pages under `src/app/admin/**/[id]/page.tsx`: use client mutation forms for update/delete and feedback states.
- Modify `src/components/tab-access-editor.tsx` and `src/components/user-access-editor.tsx`: use the same lifecycle for access mutations.
- Modify `src/components/create-user-invite-modal.tsx`: use the same lifecycle for invitation results, without pretending an invitation is chatbot-synced.
- Add tests under `tests/mutation-*.test.ts` and update route/UI tests for all mutation surfaces.

## Task 1: Define result contracts and prove the duplicate behavior

**Files:**
- Create: `src/lib/mutation-types.ts`
- Create: `src/lib/mutation-identities.ts`
- Test: `tests/mutation-identities.test.ts`
- Test: `tests/mutation-types.test.ts`

- [ ] **Step 1: Write failing identity tests.** Test that FAQ questions normalize whitespace, case, and Unicode punctuation consistently; test that faculty-scoped and general FAQs produce different keys; test that the same normalized identity is stable across repeated submissions.

```ts
test("FAQ identity is stable across casing and whitespace", () => {
  assert.equal(
    faqIdentity({ facultyId: null, category: "Support", question: "  How  do I log in? " }),
    faqIdentity({ facultyId: null, category: "support", question: "how do i log in?" }),
  );
});
```

- [ ] **Step 2: Run the identity tests and confirm they fail because the helper is missing.**

Run: `node --test --import ./node_modules/tsx/dist/loader.mjs tests/mutation-identities.test.ts`

- [ ] **Step 3: Add the minimal types and identity helpers.** Define `MutationKind`, `MutationPhase`, `MutationResult`, and `MutationError`; implement `normalizeIdentityPart`, `faqIdentity`, and `domainIdentity` without embedding UI concerns.

- [ ] **Step 4: Run the tests and confirm they pass.**

Run: `node --test --import ./node_modules/tsx/dist/loader.mjs tests/mutation-identities.test.ts tests/mutation-types.test.ts`

- [ ] **Step 5: Commit the contract slice.**

```powershell
git add src/lib/mutation-types.ts src/lib/mutation-identities.ts tests/mutation-identities.test.ts tests/mutation-types.test.ts
git commit -m "feat(mutations): define result and identity contracts"
```

## Task 2: Add durable request receipts for exactly-once writes

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/0007_mutation_receipts/migration.sql`
- Create: `src/lib/mutation-receipts.ts`
- Test: `tests/mutation-receipts.test.ts`

- [ ] **Step 1: Write failing receipt tests.** Cover first execution, repeated request id returning the stored result without invoking the writer twice, conflicting request id rejected when the payload hash differs, and failed execution recorded as retryable rather than falsely completed.

```ts
test("same request id executes the writer once", async () => {
  let writes = 0;
  const run = createInMemoryReceiptRunner();
  const first = await run.execute({ requestId: "req-1", payload: { x: 1 }, write: async () => { writes += 1; return { recordId: "r1" }; } });
  const second = await run.execute({ requestId: "req-1", payload: { x: 1 }, write: async () => { writes += 1; return { recordId: "r1" }; } });
  assert.deepEqual(second, first);
  assert.equal(writes, 1);
});
```

- [ ] **Step 2: Run the receipt tests and confirm the expected failure.**

Run: `node --test --import ./node_modules/tsx/dist/loader.mjs tests/mutation-receipts.test.ts`

- [ ] **Step 3: Add the `MutationReceipt` model and migration.** Store `request_id` as a unique text key, `payload_hash`, `kind`, `status`, `result` JSON, `error_message`, `record_id`, timestamps, and an optional `sync_job_id`. Add indexes for status and record id.

- [ ] **Step 4: Implement the transactional receipt runner.** Use a unique insert/claim operation, return completed results for duplicate requests, reject payload conflicts, and update the receipt in the same transaction as the domain write where Prisma supports it. Do not log payload values that may contain user content.

- [ ] **Step 5: Run the receipt tests and migration status.**

Run: `node --test --import ./node_modules/tsx/dist/loader.mjs tests/mutation-receipts.test.ts`

Run: `npm run db:migrate:deploy` only against the approved application database.

- [ ] **Step 6: Commit the persistence slice.**

```powershell
git add prisma/schema.prisma prisma/migrations/0007_mutation_receipts/migration.sql src/lib/mutation-receipts.ts tests/mutation-receipts.test.ts
git commit -m "feat(mutations): add exactly-once request receipts"
```

## Task 3: Make Dify sync observable and deduplicated

**Files:**
- Modify: `src/lib/dify-sync.ts`
- Create: `src/app/api/admin/mutations/[mutationId]/route.ts`
- Test: `tests/mutation-sync.test.ts`

- [ ] **Step 1: Write failing sync tests.** Test that one source record has at most one pending/processing job for the same action/content checksum, that a completed job reports `synced`, and that failed jobs report a retryable failure without creating another record.

- [ ] **Step 2: Run the tests and verify the failure.**

Run: `node --test --import ./node_modules/tsx/dist/loader.mjs tests/mutation-sync.test.ts`

- [ ] **Step 3: Add a deduplicating enqueue path.** Use a stable source/action/content checksum key; return the existing pending or completed job when the same mutation is retried. Keep delete jobs distinct from create/update jobs.

- [ ] **Step 4: Add `GET /api/admin/mutations/:mutationId`.** Require the existing admin authorization, return `{ mutationId, persistence, sync: { status, jobId, error } }`, and return 404 for unknown ids. Do not expose raw Dify credentials or arbitrary payloads.

- [ ] **Step 5: Run sync tests and typecheck.**

Run: `node --test --import ./node_modules/tsx/dist/loader.mjs tests/mutation-sync.test.ts`

Run: `npm run typecheck`

- [ ] **Step 6: Commit the sync slice.**

```powershell
git add src/lib/dify-sync.ts src/app/api/admin/mutations/[mutationId]/route.ts tests/mutation-sync.test.ts
git commit -m "feat(mutations): expose deduplicated sync status"
```

## Task 4: Build the shared centered feedback modal

**Files:**
- Create: `src/components/mutation-feedback-modal.tsx`
- Create: `src/components/mutation-form.tsx`
- Modify: `src/components/modal.tsx` or `src/components/dialog.tsx` to enforce centered placement and backdrop blur consistently.
- Test: `tests/mutation-feedback-modal.test.tsx`

- [ ] **Step 1: Write failing component tests.** Cover centered dialog semantics, blurred backdrop, spinner during `syncing`, explicit `Done` requirement, disabled submit while pending, delete confirmation copy, and accessible live-region announcements.

- [ ] **Step 2: Run the component tests and confirm they fail.**

Run: `node --test --import ./node_modules/tsx/dist/loader.mjs tests/mutation-feedback-modal.test.tsx`

- [ ] **Step 3: Implement the modal state machine.** Use `idle | submitting | saved | syncing | complete | error | confirm-delete`; render the modal at `fixed inset-0` with `flex items-center justify-center`, `backdrop-blur-sm`, `aria-modal`, focus restoration, and no backdrop-close while submitting/syncing.

- [ ] **Step 4: Implement the form bridge.** Generate one request id per submission, disable all submit paths immediately, call the server action once, poll the status endpoint with bounded backoff, and keep the modal open until `Done`.

- [ ] **Step 5: Run component tests and inspect the modal at desktop/mobile widths.**

Run: `node --test --import ./node_modules/tsx/dist/loader.mjs tests/mutation-feedback-modal.test.tsx`

- [ ] **Step 6: Commit the shared UI slice.**

```powershell
git add src/components/mutation-feedback-modal.tsx src/components/mutation-form.tsx src/components/modal.tsx src/components/dialog.tsx tests/mutation-feedback-modal.test.tsx
git commit -m "feat(ui): add centered mutation feedback modal"
```

## Task 5: Refactor server actions to structured, idempotent upserts

**Files:**
- Modify: `src/lib/admin-actions.ts`
- Modify: `src/lib/user-management-actions.ts`
- Modify: `src/lib/tab-access-actions.ts`
- Test: `tests/admin-mutation-actions.test.ts`

- [ ] **Step 1: Write failing action tests.** Cover FAQ create duplicate-as-update, request-id replay, one sync job per mutation, update result shape, delete result shape, and authorization rejection.

- [ ] **Step 2: Run tests and verify they fail against redirecting actions.**

Run: `node --test --import ./node_modules/tsx/dist/loader.mjs tests/admin-mutation-actions.test.ts`

- [ ] **Step 3: Refactor each action signature to accept `requestId` in `FormData` and return `MutationResult`.** Remove direct redirects from action bodies; return the record id, mutation id, and sync job id. Keep `revalidatePath`/`revalidateTag` after a successful write.

- [ ] **Step 4: Implement domain upserts.** FAQ uses normalized faculty/category/question identity; seeded domains use their existing seed key; resources use seed key and document identity. An exact duplicate updates content instead of creating a second row.

- [ ] **Step 5: Wrap each write and sync enqueue in the receipt runner.** Ensure a replay returns the same result and does not enqueue another job.

- [ ] **Step 6: Run action tests and typecheck.**

Run: `node --test --import ./node_modules/tsx/dist/loader.mjs tests/admin-mutation-actions.test.ts`

Run: `npm run typecheck`

- [ ] **Step 7: Commit the server-action slice.**

```powershell
git add src/lib/admin-actions.ts src/lib/user-management-actions.ts src/lib/tab-access-actions.ts tests/admin-mutation-actions.test.ts
git commit -m "feat(mutations): make admin actions idempotent upserts"
```

## Task 6: Wire all create flows

**Files:**
- Modify: `src/components/create-faculty-modal.tsx`
- Modify: `src/components/create-coach-modal.tsx`
- Modify: `src/components/create-programme-modal.tsx`
- Modify: `src/components/create-course-module-modal.tsx`
- Modify: `src/components/create-resource-modal.tsx`
- Modify: `src/components/create-resource-document-modal.tsx`
- Modify: `src/components/create-faq-modal.tsx`
- Modify: `src/components/create-user-invite-modal.tsx`
- Test: `tests/create-mutation-flows.test.tsx`

- [ ] **Step 1: Write failing UI tests.** For every modal, submit twice rapidly and assert the server action mock is called once; assert the centered modal progresses through saving/syncing/complete and only closes after `Done`.

- [ ] **Step 2: Run tests and verify current forms fail because they close or swallow errors.**

Run: `node --test --import ./node_modules/tsx/dist/loader.mjs tests/create-mutation-flows.test.tsx`

- [ ] **Step 3: Replace each local `isSubmitting`/`console.error` path with `MutationForm`.** Preserve existing fields and validation, pass the mutation kind and display name, and use the stronger delete variant only for destructive flows.

- [ ] **Step 4: Add explicit FAQ duplicate coverage.** Submit the same normalized FAQ twice, verify the second result says `Updated existing FAQ`, and verify the database row count stays constant.

- [ ] **Step 5: Run UI tests and commit.**

```powershell
node --test --import ./node_modules/tsx/dist/loader.mjs tests/create-mutation-flows.test.tsx
git add src/components/create-*.tsx tests/create-mutation-flows.test.tsx
git commit -m "feat(ui): add feedback to create flows"
```

## Task 7: Wire update and delete flows

**Files:**
- Modify: `src/app/admin/faculties/[id]/page.tsx`
- Modify: `src/app/admin/coaches/[id]/page.tsx`
- Modify: `src/app/admin/programmes/[id]/page.tsx`
- Modify: `src/app/admin/course-modules/[id]/page.tsx`
- Modify: `src/app/admin/resources/[id]/page.tsx`
- Modify: `src/app/admin/faqs/[id]/page.tsx`
- Test: `tests/edit-delete-mutation-flows.test.tsx`

- [ ] **Step 1: Write failing tests.** Assert update buttons stay disabled during submit, success remains open until `Done`, delete requires an explicit second confirmation, cancellation makes no server call, and retries reuse the same record.

- [ ] **Step 2: Run tests and confirm current server-form redirects fail the expected UI assertions.**

Run: `node --test --import ./node_modules/tsx/dist/loader.mjs tests/edit-delete-mutation-flows.test.tsx`

- [ ] **Step 3: Add client wrappers around each server action.** Preserve server-side permission checks and existing field layouts; use `router.refresh()`/`router.push()` only after the user clicks `Done`.

- [ ] **Step 4: Add delete confirmation and result copy per entity.** Show the record name, explain that deletion removes the admin record, and never allow backdrop or Escape dismissal after the delete request starts.

- [ ] **Step 5: Run tests and commit.**

```powershell
node --test --import ./node_modules/tsx/dist/loader.mjs tests/edit-delete-mutation-flows.test.tsx
git add src/app/admin tests/edit-delete-mutation-flows.test.tsx
git commit -m "feat(ui): add feedback to edit and delete flows"
```

## Task 8: Wire access-management mutations

**Files:**
- Modify: `src/components/user-access-editor.tsx`
- Modify: `src/components/tab-access-editor.tsx`
- Modify: `src/components/create-user-invite-modal.tsx`
- Test: `tests/access-mutation-flows.test.tsx`

- [ ] **Step 1: Write failing tests.** Cover role update, tab permission save, invitation result, duplicate invitation request id, and the fact that these flows show persistence feedback without claiming chatbot sync when no sync job exists.

- [ ] **Step 2: Run tests and verify the current inline-only status behavior fails the new contract.**

Run: `node --test --import ./node_modules/tsx/dist/loader.mjs tests/access-mutation-flows.test.tsx`

- [ ] **Step 3: Adapt the shared result to non-chatbot mutations.** Render `Saved successfully` followed by `Done` when `syncJobId` is absent; keep role authorization and self-edit protections unchanged.

- [ ] **Step 4: Run tests and commit.**

```powershell
node --test --import ./node_modules/tsx/dist/loader.mjs tests/access-mutation-flows.test.tsx
git add src/components/user-access-editor.tsx src/components/tab-access-editor.tsx src/components/create-user-invite-modal.tsx tests/access-mutation-flows.test.tsx
git commit -m "feat(ui): add feedback to access mutations"
```

## Task 9: End-to-end verification and documentation

**Files:**
- Test: `tests/mutation-route-smoke.test.ts`
- Modify: `README.md` with the mutation behavior and Dify worker requirement.
- Modify: `docs/superpowers/specs/2026-07-12-mutation-feedback-idempotency-design.md` only if implementation decisions materially change.

- [ ] **Step 1: Add route smoke tests for all mutation surfaces.** Exercise FAQ create/update/delete, resource create/update/delete, faculty/coach/programme/module create/update/delete, access updates, and invitation result paths with duplicate request ids.

- [ ] **Step 2: Run the focused suite.**

Run: `node --test --import ./node_modules/tsx/dist/loader.mjs tests/mutation-*.test.ts tests/mutation-*.test.tsx`

- [ ] **Step 3: Run repository verification.**

Run: `npm run typecheck`

Run: `npm run lint`

Run: `npm run build`

Run: `npm run db:migrate:deploy`

- [ ] **Step 4: Browser smoke-test the FAQ scenario.** Open the FAQ create modal, verify centered placement and backdrop blur, submit once, attempt a rapid second submit, verify one database row and one sync job, observe the spinner, verify `Live chatbot updated`, and click `Done`.

- [ ] **Step 5: Browser smoke-test delete cancellation and confirmation.** Open a delete modal, cancel and verify no write, reopen, confirm delete, verify progress and completion states, and verify the modal cannot be dismissed mid-request.

- [ ] **Step 6: Update the README with operational requirements.** Document that the Dify worker must be running for the modal to reach `Live chatbot updated`, and explain the retry behavior when Dify is unavailable.

- [ ] **Step 7: Commit verification and docs.**

```powershell
git add tests/mutation-route-smoke.test.ts README.md docs/superpowers/specs/2026-07-12-mutation-feedback-idempotency-design.md
git commit -m "test(mutations): verify feedback and exactly-once flows"
```

## Plan self-review

- Spec coverage: centered modal, explicit `Done`, loading/sync states, delete confirmation, duplicate-as-update behavior, request-id replay protection, Dify completion, all mutation surfaces, and FAQ end-to-end verification are mapped to Tasks 1-9.
- Placeholder scan: no unresolved planning placeholders remain.
- Type consistency: `MutationResult`, `requestId`, `mutationId`, `recordId`, and `syncJobId` are introduced in Task 1 and reused consistently in Tasks 2-9.
- Safety: all server actions retain existing permission checks; the migration is explicit and verified before route smoke tests.
