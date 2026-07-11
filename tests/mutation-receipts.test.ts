import assert from "node:assert/strict";
import test from "node:test";

import {
  createInMemoryReceiptRunner,
  executeMutationWithReceipt,
  hashMutationPayload,
  validateRequestId,
} from "@/lib/mutation-receipts";
import { readFileSync } from "node:fs";

test("same request id executes the writer once", async () => {
  let writes = 0;
  const run = createInMemoryReceiptRunner<{ recordId: string }>();
  const first = await run.execute({
    requestId: "req-1",
    payload: { x: 1 },
    write: async () => {
      writes += 1;
      return { recordId: "r1" };
    },
  });
  const second = await run.execute({
    requestId: "req-1",
    payload: { x: 1 },
    write: async () => {
      writes += 1;
      return { recordId: "r1" };
    },
  });

  assert.deepEqual(second, first);
  assert.equal(writes, 1);
});

test("conflicting payloads for one request id are rejected", async () => {
  const run = createInMemoryReceiptRunner<string>();
  await run.execute({ requestId: "req-1", payload: { x: 1 }, write: async () => "ok" });
  await assert.rejects(
    run.execute({ requestId: "req-1", payload: { x: 2 }, write: async () => "wrong" }),
    /different payload/i,
  );
});

test("failed execution is retryable and never returns a false success", async () => {
  let writes = 0;
  const run = createInMemoryReceiptRunner<string>();
  await assert.rejects(
    run.execute({
      requestId: "req-retry",
      payload: { x: 1 },
      write: async () => {
        writes += 1;
        throw new Error("temporary failure");
      },
    }),
    /temporary failure/,
  );
  const result = await run.execute({
    requestId: "req-retry",
    payload: { x: 1 },
    write: async () => {
      writes += 1;
      return "saved";
    },
  });
  assert.equal(result, "saved");
  assert.equal(writes, 2);
});

test("request ids are bounded and safe", () => {
  assert.equal(validateRequestId(" req-1 "), "req-1");
  assert.throws(() => validateRequestId(""), /request id/i);
  assert.throws(() => validateRequestId("x".repeat(129)), /request id/i);
  assert.equal(hashMutationPayload({ b: 2, a: 1 }), hashMutationPayload({ a: 1, b: 2 }));
});

test("durable receipt claim prevents concurrent writers", async () => {
  let writes = 0;
  const rows = new Map<string, { payloadHash: string; status: string; result: unknown }>();
  const store = {
    async findUnique({ where }: { where: { requestId: string } }) { return rows.get(where.requestId) ?? null; },
    async create({ data }: { data: { requestId: string; payloadHash: string; kind: string; status: string } }) {
      if (rows.has(data.requestId)) throw new Error("unique request id");
      rows.set(data.requestId, { payloadHash: data.payloadHash, status: data.status, result: null });
    },
    async updateMany({ where, data }: { where: { requestId: string; status: string }; data: { status: string } }) {
      const row = rows.get(where.requestId);
      if (!row || row.status !== where.status) return { count: 0 };
      row.status = data.status;
      return { count: 1 };
    },
    async update({ where, data }: { where: { requestId: string }; data: { status: string; result?: unknown; errorMessage?: string } }) {
      const row = rows.get(where.requestId);
      if (!row) throw new Error("missing receipt");
      row.status = data.status;
      row.result = data.result;
    },
  };
  const write = async () => {
    writes += 1;
    await new Promise((resolve) => setTimeout(resolve, 40));
    return "saved";
  };
  const results = await Promise.all([
    executeMutationWithReceipt({ store, requestId: "durable-1", payload: { x: 1 }, write }),
    executeMutationWithReceipt({ store, requestId: "durable-1", payload: { x: 1 }, write }),
  ]);
  assert.deepEqual(results, ["saved", "saved"]);
  assert.equal(writes, 1);
});

test("schema and migration include mutation linkage fields", () => {
  const schema = readFileSync("prisma/schema.prisma", "utf8");
  const migration = readFileSync("prisma/migrations/0007_mutation_receipts/migration.sql", "utf8");
  for (const field of ["kind", "recordId", "syncJobId", "errorMessage"]) assert.match(schema, new RegExp(field));
  for (const field of ["kind", "record_id", "sync_job_id", "error_message"]) assert.match(migration, new RegExp(field));
});
