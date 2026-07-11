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

  const syncStatus = syncJob
    ? syncJob.status === "completed" ? "synced" : syncJob.status === "failed" ? "failed" : "pending"
    : "not_applicable";
  return NextResponse.json({
    mutationId: receipt.id,
    persistence: receipt.status === "completed" ? "saved" : receipt.status === "failed" ? "failed" : "pending",
    recordId: receipt.recordId,
    sync: { status: syncStatus, jobId: syncJob?.id ?? receipt.syncJobId },
    error: receipt.errorMessage ?? syncJob?.lastError ?? null,
  });
}
