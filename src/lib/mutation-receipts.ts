import { createHash } from "node:crypto";

type ReceiptStatus = "processing" | "completed" | "failed";

type InMemoryReceipt<T> = {
  payloadHash: string;
  status: ReceiptStatus;
  result?: T;
  inFlight?: Promise<T>;
};

export class MutationReceiptConflictError extends Error {
  constructor() {
    super("The request id was already used with a different payload.");
    this.name = "MutationReceiptConflictError";
  }
}

export function validateRequestId(requestId: string): string {
  const normalized = requestId.trim();
  if (!normalized || normalized.length > 128 || !/^[a-zA-Z0-9._:-]+$/.test(normalized)) {
    throw new Error("A valid request id is required.");
  }
  return normalized;
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, entry]) => [key, stableValue(entry)]),
    );
  }
  return value;
}

export function hashMutationPayload(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(stableValue(payload))).digest("hex");
}

export function createInMemoryReceiptRunner<T>() {
  const receipts = new Map<string, InMemoryReceipt<T>>();

  return {
    async execute(input: {
      requestId: string;
      payload: unknown;
      write: () => Promise<T>;
    }): Promise<T> {
      const requestId = validateRequestId(input.requestId);
      const payloadHash = hashMutationPayload(input.payload);
      const existing = receipts.get(requestId);
      if (existing) {
        if (existing.payloadHash !== payloadHash) throw new MutationReceiptConflictError();
        if (existing.status === "completed") return existing.result as T;
        if (existing.status === "processing" && existing.inFlight) return existing.inFlight;
      }

      const writePromise = (async () => {
        try {
          const result = await input.write();
          receipts.set(requestId, { payloadHash, status: "completed", result });
          return result;
        } catch (error) {
          receipts.set(requestId, { payloadHash, status: "failed" });
          throw error;
        }
      })();
      receipts.set(requestId, { payloadHash, status: "processing", inFlight: writePromise });
      return writePromise;
    },
  };
}

export type MutationReceiptStore = {
  findUnique(args: { where: { requestId: string } }): Promise<{
    payloadHash: string;
    status: string;
    result: unknown;
  } | null>;
  create(args: { data: { requestId: string; payloadHash: string; status: string } }): Promise<unknown>;
  update(args: {
    where: { requestId: string };
    data: { status: string; result?: unknown; error?: string };
  }): Promise<unknown>;
};

/** Execute a mutation once using the durable MutationReceipt table. */
export async function executeMutationWithReceipt<T>(input: {
  store: MutationReceiptStore;
  requestId: string;
  payload: unknown;
  write: () => Promise<T>;
}): Promise<T> {
  const requestId = validateRequestId(input.requestId);
  const payloadHash = hashMutationPayload(input.payload);
  const existing = await input.store.findUnique({ where: { requestId } });
  if (existing) {
    if (existing.payloadHash !== payloadHash) throw new MutationReceiptConflictError();
    if (existing.status === "completed") return existing.result as T;
  } else {
    try {
      await input.store.create({ data: { requestId, payloadHash, status: "processing" } });
    } catch {
      // Another request won the unique request-id race; read its receipt below.
    }
    const raced = await input.store.findUnique({ where: { requestId } });
    if (raced?.payloadHash !== payloadHash) throw new MutationReceiptConflictError();
    if (raced?.status === "completed") return raced.result as T;
  }

  try {
        const result = await input.write();
        await input.store.update({ where: { requestId }, data: { status: "completed", result } });
        return result;
  } catch (error) {
    await input.store.update({
      where: { requestId },
      data: { status: "failed", error: error instanceof Error ? error.message : "Mutation failed" },
    });
    throw error;
  }
}
