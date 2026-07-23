import { NextResponse } from "next/server";

import { getCurrentAuthorization } from "@/lib/rbac";
import { processPendingDifySyncJobs } from "@/lib/dify-sync";

/**
 * POST /api/admin/dify-sync/process
 *
 * Drains up to `limit` pending DifySyncJob rows by calling the Dify API
 * immediately. Called by MutationForm right after a save so the UI polling
 * loop finds a completed job instead of waiting for an external cron.
 *
 * Query params:
 *   ?limit=<number>  – max jobs to process in this call (default: 10)
 *   ?jobId=<string>  – optional: only process this specific job (runs 1 job)
 */
export async function POST(request: Request) {
  const authz = await getCurrentAuthorization();
  if (!authz) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (authz.role !== "admin" && authz.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const rawLimit = searchParams.get("limit");
  const limit = rawLimit ? Math.min(Math.max(1, Number(rawLimit) || 10), 50) : 10;

  try {
    const results = await processPendingDifySyncJobs(limit);
    const completed = results.filter((r) => r.status === "completed").length;
    const failed = results.filter((r) => r.status === "failed").length;
    const pending = results.filter((r) => r.status === "pending").length;

    return NextResponse.json({
      ok: true,
      processed: results.length,
      completed,
      failed,
      pending,
      results,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error processing Dify sync jobs";
    console.error("[dify-sync/process] Unhandled error:", error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
