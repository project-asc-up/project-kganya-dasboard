import { getPrismaClient } from "@/lib/prisma";

const prisma = getPrismaClient();

export async function getFacultyOptions() {
  return prisma.faculty.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, code: true },
  });
}

export async function getFacultyRows() {
  return prisma.faculty.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      code: true,
      codeStatus: true,
      officialPageUrl: true,
      supportPageUrl: true,
      lastVerified: true,
      aliases: true,
      _count: {
        select: {
          ascCoaches: true,
          programmes: true,
          resources: true,
          faqs: true,
        },
      },
    },
  });
}

export async function getFacultyById(id: string) {
  return prisma.faculty.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          ascCoaches: true,
          programmes: true,
          resources: true,
          faqs: true,
        },
      },
      ascCoaches: {
        select: {
          id: true,
          name: true,
          email: true,
          level: true,
          isActive: true,
        },
        orderBy: { name: "asc" },
      },
      programmes: {
        select: {
          id: true,
          programmeCode: true,
          programmeName: true,
          qualificationType: true,
        },
        orderBy: { programmeName: "asc" },
      },
    },
  });
}

export async function getCoachRows() {
  return prisma.ascCoach.findMany({
    orderBy: [{ faculty: { name: "asc" } }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      cell: true,
      titleRole: true,
      level: true,
      cluster: true,
      isActive: true,
      verificationStatus: true,
      faculty: {
        select: { id: true, name: true, code: true },
      },
    },
  });
}

export async function getCoachById(id: string) {
  return prisma.ascCoach.findUnique({
    where: { id },
    include: {
      faculty: { select: { id: true, name: true, code: true } },
    },
  });
}

export async function getProgrammeRows() {
  return prisma.programme.findMany({
    orderBy: [{ faculty: { name: "asc" } }, { programmeName: "asc" }],
    select: {
      id: true,
      programmeCode: true,
      programmeName: true,
      degreeName: true,
      academicLevel: true,
      qualificationType: true,
      durationYears: true,
      programmeCredits: true,
      yearLevels: true,
      faculty: {
        select: { id: true, name: true, code: true },
      },
      _count: {
        select: {
          courseModules: true,
        },
      },
    },
  });
}

export async function getProgrammeById(id: string) {
  return prisma.programme.findUnique({
    where: { id },
    include: {
      faculty: { select: { id: true, name: true, code: true } },
      courseModules: {
        select: {
          id: true,
          moduleCode: true,
          moduleName: true,
          yearLevelRaw: true,
          moduleType: true,
          moduleUnits: true,
        },
        orderBy: [{ yearLevelSort: "asc" }, { moduleCode: "asc" }],
      },
    },
  });
}

export async function getCourseModulePage({
  query,
  page,
  pageSize,
}: {
  query?: string;
  page: number;
  pageSize: number;
}) {
  const trimmedQuery = query?.trim();

  const where = trimmedQuery
    ? {
        OR: [
          { moduleCode: { contains: trimmedQuery, mode: "insensitive" as const } },
          { moduleName: { contains: trimmedQuery, mode: "insensitive" as const } },
          { programmeCode: { contains: trimmedQuery, mode: "insensitive" as const } },
          { programmeName: { contains: trimmedQuery, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const [rows, total] = await Promise.all([
    prisma.courseModule.findMany({
      where,
      orderBy: [
        { programmeCode: "asc" },
        { yearLevelSort: "asc" },
        { moduleCode: "asc" },
      ],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        moduleCode: true,
        moduleName: true,
        yearLevelRaw: true,
        yearLevelSort: true,
        moduleType: true,
        moduleUnits: true,
        programmeCode: true,
        programmeName: true,
        facultyCode: true,
        sourceFile: true,
        programme: {
          select: {
            id: true,
            programmeCode: true,
            programmeName: true,
            faculty: { select: { id: true, name: true, code: true } },
          },
        },
      },
    }),
    prisma.courseModule.count({ where }),
  ]);

  return { rows, total };
}

export async function getCourseModuleById(id: string) {
  return prisma.courseModule.findUnique({
    where: { id },
    include: {
      programme: {
        include: {
          faculty: { select: { id: true, name: true, code: true } },
        },
      },
    },
  });
}

export async function getResourceRows() {
  return prisma.resource.findMany({
    orderBy: [{ category: "asc" }, { title: "asc" }],
    select: {
      id: true,
      seedKey: true,
      category: true,
      title: true,
      description: true,
      url: true,
      sourceUrl: true,
      lastVerified: true,
      faculty: { select: { id: true, name: true, code: true } },
    },
  });
}

export async function getResourceById(id: string) {
  return prisma.resource.findUnique({
    where: { id },
    include: {
      faculty: { select: { id: true, name: true, code: true } },
    },
  });
}

export async function getFaqRows() {
  return prisma.faq.findMany({
    orderBy: [{ priority: "asc" }, { category: "asc" }, { question: "asc" }],
    select: {
      id: true,
      seedKey: true,
      question: true,
      answer: true,
      category: true,
      priority: true,
      sourceUrl: true,
      lastVerified: true,
      faculty: { select: { id: true, name: true, code: true } },
    },
  });
}

export async function getFaqById(id: string) {
  return prisma.faq.findUnique({
    where: { id },
    include: {
      faculty: { select: { id: true, name: true, code: true } },
    },
  });
}

export async function getHealthOverview() {
  const prisma = getPrismaClient();

  const [
    faculties,
    coaches,
    programmes,
    modules,
    resources,
    faqs,
    facultyNeedsReview,
    coachInactive,
    coachNeedReview,
    programmeNoDuration,
    moduleNoYearSort,
    resourceNoVerification,
    faqNoVerification,
  ] = await Promise.all([
    prisma.faculty.count(),
    prisma.ascCoach.count(),
    prisma.programme.count(),
    prisma.courseModule.count(),
    prisma.resource.count(),
    prisma.faq.count(),
    prisma.faculty.count({
      where: { OR: [{ codeStatus: { not: "verified" } }, { lastVerified: null }] },
    }),
    prisma.ascCoach.count({ where: { isActive: false } }),
    prisma.ascCoach.count({
      where: {
        OR: [{ verificationStatus: { not: "verified-single-source" } }, { lastVerified: null }],
      },
    }),
    prisma.programme.count({ where: { OR: [{ durationYears: null }, { lastVerified: null }] } }),
    prisma.courseModule.count({ where: { OR: [{ yearLevelSort: null }, { lastVerified: null }] } }),
    prisma.resource.count({ where: { lastVerified: null } }),
    prisma.faq.count({ where: { lastVerified: null } }),
  ]);

  return {
    totals: { faculties, coaches, programmes, modules, resources, faqs },
    risk: {
      facultyNeedsReview,
      coachInactive,
      coachNeedReview,
      programmeNoDuration,
      moduleNoYearSort,
      resourceNoVerification,
      faqNoVerification,
    },
  };
}
