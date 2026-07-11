import assert from "node:assert/strict";
import test from "node:test";

import {
  createInMemoryReceiptRunner,
  hashMutationPayload,
  validateRequestId,
} from "@/lib/mutation-receipts";

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
