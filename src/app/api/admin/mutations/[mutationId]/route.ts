import { NextResponse } from "next/server";

import { getCurrentAuthorization } from "@/lib/rbac";
import { getPrismaClient } from "@/lib/prisma";

type RouteContext = { params: Promise<{ mutationId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authz = await getCurrentAuthorization();
  if (!authz) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (authz.role !== "admin" && authz.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { mutationId } = await context.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(mutationId)) {
    return NextResponse.json({ error: "Invalid mutation id" }, { status: 400 });
  }

  const prisma = getPrismaClient();
  const receipt = await prisma.mutationReceipt.findUnique({ where: { id: mutationId } });
  if (!receipt) return NextResponse.json({ error: "Mutation not found" }, { status: 404 });

  const syncJob = receipt.syncJobId
    ? await prisma.difySyncJob.findUnique({ where: { id: receipt.syncJobId } })
    : null;

  return NextResponse.json({
    mutation: {
      id: receipt.id,
      requestId: receipt.requestId,
      kind: receipt.kind,
      recordId: receipt.recordId,
      status: receipt.status,
      result: receipt.result,
      errorMessage: receipt.errorMessage,
    },
    sync: syncJob
      ? { jobId: syncJob.id, status: syncJob.status, lastError: syncJob.lastError }
      : { jobId: receipt.syncJobId, status: "not_applicable", lastError: null },
  });
}
