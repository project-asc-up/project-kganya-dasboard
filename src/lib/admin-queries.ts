import { unstable_cache } from "next/cache";

import { ADMIN_CACHE_TAGS } from "@/lib/admin-cache-tags";
import { getPrismaClient } from "@/lib/prisma";

function containsInsensitive(value: string) {
  return { contains: value, mode: "insensitive" as const };
}

function getTrimmedQuery(query?: string) {
  const trimmed = query?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

export async function getFacultyOptions() {
  return getFacultyOptionsCached();
}

const getFacultyOptionsCached = unstable_cache(
  async () => {
    const prisma = getPrismaClient();
    return prisma.faculty.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, code: true },
    });
  },
  ["faculty-options"],
  { tags: [ADMIN_CACHE_TAGS.faculties], revalidate: 300 },
);

export async function getFacultyRows() {
  return getFacultyRowsCached();
}

const getFacultyRowsCached = unstable_cache(
  async () => {
    const prisma = getPrismaClient();
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
  },
  ["faculty-rows"],
  { tags: [ADMIN_CACHE_TAGS.faculties], revalidate: 300 },
);

export async function getFacultyById(id: string) {
  return getFacultyByIdCached(id);
}

const getFacultyByIdCached = unstable_cache(
  async (id: string) => {
    const prisma = getPrismaClient();
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
  },
  ["faculty-by-id"],
  { tags: [ADMIN_CACHE_TAGS.faculties], revalidate: 300 },
);

export async function getCoachRows() {
  return getCoachRowsCached();
}

const getCoachRowsCached = unstable_cache(
  async () => {
    const prisma = getPrismaClient();
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
  },
  ["coach-rows"],
  { tags: [ADMIN_CACHE_TAGS.coaches], revalidate: 300 },
);

export async function getCoachById(id: string) {
  return getCoachByIdCached(id);
}

const getCoachByIdCached = unstable_cache(
  async (id: string) => {
    const prisma = getPrismaClient();
    return prisma.ascCoach.findUnique({
      where: { id },
      include: {
        faculty: { select: { id: true, name: true, code: true } },
      },
    });
  },
  ["coach-by-id"],
  { tags: [ADMIN_CACHE_TAGS.coaches], revalidate: 300 },
);

export async function getProgrammeRows() {
  return getProgrammeRowsCached();
}

export async function getProgrammeOptions() {
  return getProgrammeOptionsCached();
}

const getProgrammeRowsCached = unstable_cache(
  async () => {
    const prisma = getPrismaClient();
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
  },
  ["programme-rows"],
  { tags: [ADMIN_CACHE_TAGS.programmes], revalidate: 300 },
);

const getProgrammeOptionsCached = unstable_cache(
  async () => {
    const prisma = getPrismaClient();
    return prisma.programme.findMany({
      orderBy: [{ faculty: { name: "asc" } }, { programmeName: "asc" }],
      select: {
        id: true,
        programmeCode: true,
        programmeName: true,
        faculty: {
          select: { id: true, name: true, code: true },
        },
      },
    });
  },
  ["programme-options"],
  { tags: [ADMIN_CACHE_TAGS.programmes], revalidate: 300 },
);

export async function getProgrammeById(id: string) {
  return getProgrammeByIdCached(id);
}

const getProgrammeByIdCached = unstable_cache(
  async (id: string) => {
    const prisma = getPrismaClient();
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
  },
  ["programme-by-id"],
  { tags: [ADMIN_CACHE_TAGS.programmes], revalidate: 300 },
);

export async function getCourseModulePage({
  query,
  page,
  pageSize,
  facultyId,
  programmeId,
}: {
  query?: string;
  page: number;
  pageSize: number;
  facultyId?: string;
  programmeId?: string;
}) {
  return getCourseModulePageCached({ query, page, pageSize, facultyId, programmeId });
}

const getCourseModulePageCached = unstable_cache(
  async ({
    query,
    page,
    pageSize,
    facultyId,
    programmeId,
  }: {
    query?: string;
    page: number;
    pageSize: number;
    facultyId?: string;
    programmeId?: string;
  }) => {
    const prisma = getPrismaClient();
    const trimmedQuery = getTrimmedQuery(query);

    const conditions: Array<Record<string, unknown>> = [];

    if (trimmedQuery) {
      conditions.push({
        OR: [
          { moduleCode: containsInsensitive(trimmedQuery) },
          { moduleName: containsInsensitive(trimmedQuery) },
          { programmeCode: containsInsensitive(trimmedQuery) },
          { programmeName: containsInsensitive(trimmedQuery) },
          {
            programme: {
              faculty: {
                OR: [{ name: containsInsensitive(trimmedQuery) }, { code: containsInsensitive(trimmedQuery) }],
              },
            },
          },
        ],
      });
    }

    if (facultyId && facultyId !== "all") {
      conditions.push({
        programme: {
          facultyId,
        },
      });
    }

    if (programmeId && programmeId !== "all") {
      conditions.push({ programmeId });
    }

    const where = conditions.length > 0 ? { AND: conditions } : undefined;

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
  },
  ["course-module-page"],
  { tags: [ADMIN_CACHE_TAGS.courseModules], revalidate: 120 },
);

export async function getCourseModuleById(id: string) {
  return getCourseModuleByIdCached(id);
}

const getCourseModuleByIdCached = unstable_cache(
  async (id: string) => {
    const prisma = getPrismaClient();
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
  },
  ["course-module-by-id"],
  { tags: [ADMIN_CACHE_TAGS.courseModules], revalidate: 300 },
);

export async function getResourceRows() {
  return getResourceRowsCached();
}

const getResourceRowsCached = unstable_cache(
  async () => {
    const prisma = getPrismaClient();
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
  },
  ["resource-rows"],
  { tags: [ADMIN_CACHE_TAGS.resources], revalidate: 300 },
);

export async function getResourceById(id: string) {
  return getResourceByIdCached(id);
}

const getResourceByIdCached = unstable_cache(
  async (id: string) => {
    const prisma = getPrismaClient();
    return prisma.resource.findUnique({
      where: { id },
      include: {
        faculty: { select: { id: true, name: true, code: true } },
      },
    });
  },
  ["resource-by-id"],
  { tags: [ADMIN_CACHE_TAGS.resources], revalidate: 300 },
);

export async function getFaqRows() {
  return getFaqRowsCached();
}

const getFaqRowsCached = unstable_cache(
  async () => {
    const prisma = getPrismaClient();
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
  },
  ["faq-rows"],
  { tags: [ADMIN_CACHE_TAGS.faqs], revalidate: 300 },
);

export async function getFaqById(id: string) {
  return getFaqByIdCached(id);
}

const getFaqByIdCached = unstable_cache(
  async (id: string) => {
    const prisma = getPrismaClient();
    return prisma.faq.findUnique({
      where: { id },
      include: {
        faculty: { select: { id: true, name: true, code: true } },
      },
    });
  },
  ["faq-by-id"],
  { tags: [ADMIN_CACHE_TAGS.faqs], revalidate: 300 },
);

export async function searchFacultyRows(query: string, take?: number) {
  return searchFacultyRowsCached(query, take);
}

const searchFacultyRowsCached = unstable_cache(
  async (query: string, take?: number) => {
    const prisma = getPrismaClient();
    const trimmedQuery = getTrimmedQuery(query);
    if (!trimmedQuery) return [];

    return prisma.faculty.findMany({
      where: {
        OR: [
          { name: containsInsensitive(trimmedQuery) },
          { code: containsInsensitive(trimmedQuery) },
          { codeStatus: containsInsensitive(trimmedQuery) },
          { aliases: { contains: trimmedQuery, mode: "insensitive" as const } },
        ],
      },
      orderBy: { name: "asc" },
      take,
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
  },
  ["search-faculty-rows"],
  { tags: [ADMIN_CACHE_TAGS.faculties], revalidate: 60 },
);

export async function searchCoachRows(query: string, take?: number) {
  return searchCoachRowsCached(query, take);
}

const searchCoachRowsCached = unstable_cache(
  async (query: string, take?: number) => {
    const prisma = getPrismaClient();
    const trimmedQuery = getTrimmedQuery(query);
    if (!trimmedQuery) return [];

    return prisma.ascCoach.findMany({
      where: {
        OR: [
          { name: containsInsensitive(trimmedQuery) },
          { email: containsInsensitive(trimmedQuery) },
          { titleRole: { contains: trimmedQuery, mode: "insensitive" as const } },
          { cluster: { contains: trimmedQuery, mode: "insensitive" as const } },
          {
            faculty: {
              OR: [{ name: containsInsensitive(trimmedQuery) }, { code: containsInsensitive(trimmedQuery) }],
            },
          },
        ],
      },
      orderBy: [{ faculty: { name: "asc" } }, { name: "asc" }],
      take,
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
  },
  ["search-coach-rows"],
  { tags: [ADMIN_CACHE_TAGS.coaches, ADMIN_CACHE_TAGS.faculties], revalidate: 60 },
);

export async function searchProgrammeRows(query: string, take?: number) {
  return searchProgrammeRowsCached(query, take);
}

const searchProgrammeRowsCached = unstable_cache(
  async (query: string, take?: number) => {
    const prisma = getPrismaClient();
    const trimmedQuery = getTrimmedQuery(query);
    if (!trimmedQuery) return [];

    return prisma.programme.findMany({
      where: {
        OR: [
          { programmeCode: containsInsensitive(trimmedQuery) },
          { programmeName: containsInsensitive(trimmedQuery) },
          { degreeName: { contains: trimmedQuery, mode: "insensitive" as const } },
          { academicLevel: { contains: trimmedQuery, mode: "insensitive" as const } },
          { qualificationType: { contains: trimmedQuery, mode: "insensitive" as const } },
          {
            faculty: {
              OR: [{ name: containsInsensitive(trimmedQuery) }, { code: containsInsensitive(trimmedQuery) }],
            },
          },
        ],
      },
      orderBy: [{ faculty: { name: "asc" } }, { programmeName: "asc" }],
      take,
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
  },
  ["search-programme-rows"],
  { tags: [ADMIN_CACHE_TAGS.programmes, ADMIN_CACHE_TAGS.faculties], revalidate: 60 },
);

export async function searchResourceRows(query: string, take?: number) {
  return searchResourceRowsCached(query, take);
}

const searchResourceRowsCached = unstable_cache(
  async (query: string, take?: number) => {
    const prisma = getPrismaClient();
    const trimmedQuery = getTrimmedQuery(query);
    if (!trimmedQuery) return [];

    return prisma.resource.findMany({
      where: {
        OR: [
          { title: containsInsensitive(trimmedQuery) },
          { description: { contains: trimmedQuery, mode: "insensitive" as const } },
          { category: containsInsensitive(trimmedQuery) },
          { url: containsInsensitive(trimmedQuery) },
          {
            faculty: {
              is: {
                OR: [{ name: containsInsensitive(trimmedQuery) }, { code: containsInsensitive(trimmedQuery) }],
              },
            },
          },
        ],
      },
      orderBy: [{ category: "asc" }, { title: "asc" }],
      take,
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
  },
  ["search-resource-rows"],
  { tags: [ADMIN_CACHE_TAGS.resources, ADMIN_CACHE_TAGS.faculties], revalidate: 60 },
);

export async function searchFaqRows(query: string, take?: number) {
  return searchFaqRowsCached(query, take);
}

const searchFaqRowsCached = unstable_cache(
  async (query: string, take?: number) => {
    const prisma = getPrismaClient();
    const trimmedQuery = getTrimmedQuery(query);
    if (!trimmedQuery) return [];

    return prisma.faq.findMany({
      where: {
        OR: [
          { question: containsInsensitive(trimmedQuery) },
          { answer: containsInsensitive(trimmedQuery) },
          { category: containsInsensitive(trimmedQuery) },
          {
            faculty: {
              is: {
                OR: [{ name: containsInsensitive(trimmedQuery) }, { code: containsInsensitive(trimmedQuery) }],
              },
            },
          },
        ],
      },
      orderBy: [{ priority: "asc" }, { category: "asc" }, { question: "asc" }],
      take,
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
  },
  ["search-faq-rows"],
  { tags: [ADMIN_CACHE_TAGS.faqs, ADMIN_CACHE_TAGS.faculties], revalidate: 60 },
);

export async function searchCourseModuleRows(query: string, take?: number) {
  return searchCourseModuleRowsCached(query, take);
}

const searchCourseModuleRowsCached = unstable_cache(
  async (query: string, take?: number) => {
    const prisma = getPrismaClient();
    const trimmedQuery = getTrimmedQuery(query);
    if (!trimmedQuery) return [];

    return prisma.courseModule.findMany({
      where: {
        OR: [
          { moduleCode: containsInsensitive(trimmedQuery) },
          { moduleName: containsInsensitive(trimmedQuery) },
          { programmeCode: containsInsensitive(trimmedQuery) },
          { programmeName: containsInsensitive(trimmedQuery) },
          {
            programme: {
              faculty: {
                OR: [{ name: containsInsensitive(trimmedQuery) }, { code: containsInsensitive(trimmedQuery) }],
              },
            },
          },
        ],
      },
      orderBy: [
        { programmeCode: "asc" },
        { yearLevelSort: "asc" },
        { moduleCode: "asc" },
      ],
      take,
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
    });
  },
  ["search-course-module-rows"],
  {
    tags: [ADMIN_CACHE_TAGS.courseModules, ADMIN_CACHE_TAGS.programmes, ADMIN_CACHE_TAGS.faculties],
    revalidate: 60,
  },
);

export async function getHealthOverview() {
  return getHealthOverviewCached();
}

const getHealthOverviewCached = unstable_cache(
  async () => {
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
  },
  ["health-overview"],
  { tags: [ADMIN_CACHE_TAGS.health, ADMIN_CACHE_TAGS.faculties, ADMIN_CACHE_TAGS.coaches, ADMIN_CACHE_TAGS.programmes, ADMIN_CACHE_TAGS.courseModules, ADMIN_CACHE_TAGS.resources, ADMIN_CACHE_TAGS.faqs], revalidate: 120 },
);
