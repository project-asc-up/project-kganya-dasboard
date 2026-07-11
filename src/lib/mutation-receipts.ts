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

function canonicalValue(value: unknown): string {
  if (value === undefined) return '{"$type":"undefined"}';
  if (value === null) return "null";
  if (typeof value === "string" || typeof value === "boolean") return JSON.stringify(value);
  if (typeof value === "number") {
    if (Number.isNaN(value)) return '{"$type":"nan"}';
    if (value === Infinity) return '{"$type":"infinity"}';
    if (value === -Infinity) return '{"$type":"-infinity"}';
    return JSON.stringify(value);
  }
  if (typeof value === "bigint") return JSON.stringify({ $type: "bigint", value: value.toString() });
  if (value instanceof Date) return JSON.stringify({ $type: "date", value: value.toISOString() });
  if (Array.isArray(value)) return `[${value.map(canonicalValue).join(",")}]`;
  if (typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, entry]) => `${JSON.stringify(key)}:${canonicalValue(entry)}`)
      .join(",")}}`;
  }
  return JSON.stringify({ $type: typeof value });
}

export function hashMutationPayload(payload: unknown): string {
  return createHash("sha256").update(canonicalValue(payload)).digest("hex");
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
    kind?: string;
    recordId?: string | null;
    syncJobId?: string | null;
    status: string;
    result: unknown;
    errorMessage?: string | null;
  } | null>;
  create(args: { data: {
    requestId: string;
    payloadHash: string;
    kind: string;
    status: string;
    recordId?: string | null;
    syncJobId?: string | null;
  } }): Promise<unknown>;
  updateMany(args: {
    where: { requestId: string; status: string };
    data: { status: string };
  }): Promise<{ count: number }>;
  update(args: {
    where: { requestId: string };
    data: { status: string; result?: unknown; errorMessage?: string };
  }): Promise<unknown>;
};

/** Execute a mutation once using the durable MutationReceipt table. */
export async function executeMutationWithReceipt<T>(input: {
  store: MutationReceiptStore;
  requestId: string;
  payload: unknown;
  kind?: string;
  write: () => Promise<T>;
}): Promise<T> {
  const requestId = validateRequestId(input.requestId);
  const payloadHash = hashMutationPayload(input.payload);
  const existing = await input.store.findUnique({ where: { requestId } });
  if (existing) {
    if (existing.payloadHash !== payloadHash) throw new MutationReceiptConflictError();
    if (existing.status === "completed") return existing.result as T;
    if (existing.status === "processing") {
      for (let attempt = 0; attempt < 120; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 25));
        const current = await input.store.findUnique({ where: { requestId } });
        if (current?.status === "completed") return current.result as T;
        if (current?.status === "failed") break;
      }
      throw new Error("Mutation receipt is still processing; retry after it completes.");
    }
    if (existing.status === "failed") {
      const claimed = await input.store.updateMany({
        where: { requestId, status: "failed" },
        data: { status: "processing" },
      });
      if (claimed.count !== 1) throw new Error("Mutation receipt could not be claimed for retry.");
    }
  } else {
    let claimed = false;
    try {
      await input.store.create({ data: { requestId, payloadHash, kind: input.kind ?? "unknown", status: "processing" } });
      claimed = true;
    } catch {
      // Another request won the unique request-id race; read its receipt below.
    }
    if (!claimed) {
      const raced = await input.store.findUnique({ where: { requestId } });
      if (raced?.payloadHash !== payloadHash) throw new MutationReceiptConflictError();
      if (raced?.status === "completed") return raced.result as T;
      if (raced?.status === "processing") {
        for (let attempt = 0; attempt < 120; attempt += 1) {
          await new Promise((resolve) => setTimeout(resolve, 25));
          const current = await input.store.findUnique({ where: { requestId } });
          if (current?.status === "completed") return current.result as T;
          if (current?.status === "failed") throw new Error("Mutation receipt failed; retry the mutation.");
        }
        throw new Error("Mutation receipt is still processing; retry after it completes.");
      }
    }
  }

  try {
        const result = await input.write();
        await input.store.update({ where: { requestId }, data: { status: "completed", result } });
        return result;
  } catch (error) {
    await input.store.update({
      where: { requestId },
      data: { status: "failed", errorMessage: error instanceof Error ? error.message : "Mutation failed" },
    });
    throw error;
  }
}
