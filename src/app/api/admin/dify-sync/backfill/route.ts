import { NextResponse } from "next/server";

import { buildResourceTextContent, enqueueDifySyncJob, processPendingDifySyncJobs } from "@/lib/dify-sync";
import { getPrismaClient } from "@/lib/prisma";
import { getCurrentAuthorization } from "@/lib/rbac";

function formatError(error: unknown): Record<string, unknown> {
  if (error && typeof error === "object") {
    const err = error as Record<string, unknown>;
    return {
      name: err.name,
      message: err.message,
      code: err.code,
      meta: err.meta,
      clientVersion: err.clientVersion,
      stack: err.stack,
    };
  }
  return { message: String(error) };
}

/**
 * POST /api/admin/dify-sync/backfill
 *
 * Scans resources and enqueues missing DifySyncJobs, then processes them.
 * Supports authentication via Clerk session OR ?secret=<ADMIN_PASSWORD>.
 */
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const secretParam = searchParams.get("secret");
  const adminPassword = process.env.ADMIN_PASSWORD;

  const isSecretAuth = Boolean(adminPassword && secretParam === adminPassword);

  if (!isSecretAuth) {
    const authz = await getCurrentAuthorization();
    if (!authz) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (authz.role !== "admin" && authz.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  try {
    const prisma = getPrismaClient();
    const resources = await prisma.resource.findMany({
      orderBy: [{ updatedAt: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        title: true,
        category: true,
        description: true,
        url: true,
        sourceUrl: true,
        notes: true,
      },
    });

    let queuedCount = 0;

    for (const resource of resources) {
      const existing = await prisma.difySyncMap.findUnique({
        where: {
          sourceTable_sourceId: {
            sourceTable: "resources",
            sourceId: resource.id,
          },
        },
      });

      if (existing?.syncStatus === "synced" && existing.difyDocumentId) {
        continue;
      }

      await enqueueDifySyncJob({
        sourceTable: "resources",
        sourceId: resource.id,
        action: "create",
        contentKind: "text",
        inputChecksum: null,
        payload: {
          name: resource.title,
          text: buildResourceTextContent({
            title: resource.title,
            category: resource.category,
            description: resource.description,
            url: resource.url,
            sourceUrl: resource.sourceUrl,
            notes: resource.notes,
          }),
        },
      });

      queuedCount++;
    }

    // Process queued jobs immediately (up to 50)
    const processResults = await processPendingDifySyncJobs(50);

    // Fetch the jobs details to include lastError in output
    const jobIds = processResults.map((r) => r.jobId);
    const jobs = await prisma.difySyncJob.findMany({
      where: { id: { in: jobIds } },
      select: { id: true, status: true, attemptCount: true, lastError: true },
    });

    return NextResponse.json({
      ok: true,
      totalResources: resources.length,
      queued: queuedCount,
      processed: processResults.length,
      jobs,
    });
  } catch (error) {
    const errorDetails = formatError(error);
    console.error("[dify-sync/backfill] Error:", errorDetails);
    return NextResponse.json({ ok: false, error: errorDetails }, { status: 500 });
  }
}
