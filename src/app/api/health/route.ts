import { getPrismaClient } from "@/lib/prisma";

export async function GET() {
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

  if (!hasDatabaseUrl) {
    return Response.json(
      {
        ok: false,
        database: {
          connected: false,
          reason: "DATABASE_URL is not configured",
        },
      },
      { status: 500 },
    );
  }

  try {
    const prisma = getPrismaClient();
    const [facultyCount, coachCount, programmeCount, moduleCount, resourceCount, faqCount] =
      await Promise.all([
        prisma.faculty.count(),
        prisma.ascCoach.count(),
        prisma.programme.count(),
        prisma.courseModule.count(),
        prisma.resource.count(),
        prisma.faq.count(),
      ]);

    return Response.json({
      ok: true,
      database: {
        connected: true,
        counts: {
          faculties: facultyCount,
          ascCoaches: coachCount,
          programmes: programmeCount,
          courseModules: moduleCount,
          resources: resourceCount,
          faqs: faqCount,
        },
      },
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        database: {
          connected: false,
          reason: error instanceof Error ? error.message : "Unknown database error",
        },
      },
      { status: 500 },
    );
  }
}
