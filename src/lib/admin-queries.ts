import { unstable_cache } from "next/cache";

import { ADMIN_CACHE_TAGS } from "@/lib/admin-cache-tags";
import { getPrismaClient } from "@/lib/prisma";

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

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
        sourceUrl: true,
        lastVerified: true,
        notes: true,
        aliases: true,
        _count: {
          select: {
            ascCoaches: true,
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
  if (!isUuid(id)) return null;
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
  if (!isUuid(id)) return null;
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
        attachmentName: true,
        attachmentMimeType: true,
        attachmentSizeBytes: true,
        attachmentStatus: true,
        attachmentError: true,
        faculty: { select: { id: true, name: true, code: true } },
      },
    });
  },
  ["resource-rows"],
  { tags: [ADMIN_CACHE_TAGS.resources], revalidate: 300 },
);

export async function getResourceById(id: string) {
  if (!isUuid(id)) return null;
  return getResourceByIdCached(id);
}

const getResourceByIdCached = unstable_cache(
  async (id: string) => {
    const prisma = getPrismaClient();
    const resource = await prisma.resource.findUnique({
      where: { id },
      include: {
        faculty: { select: { id: true, name: true, code: true } },
      },
    });

    if (!resource) {
      return null;
    }

    const difySyncMap = resource.difyDocumentId ? {
      syncStatus: "synced",
      difyDocumentId: resource.difyDocumentId,
      lastSyncedAt: resource.updatedAt,
      lastError: null,
    } : (resource.attachmentStatus === "failed" ? {
      syncStatus: "failed",
      difyDocumentId: null,
      lastSyncedAt: null,
      lastError: resource.attachmentError,
    } : null);

    return {
      ...resource,
      difySyncMap,
    };
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
  if (!isUuid(id)) return null;
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

export async function getHealthOverview() {
  return getHealthOverviewCached();
}

const getHealthOverviewCached = unstable_cache(
  async () => {
  const prisma = getPrismaClient();

  const [
    faculties,
    coaches,
    resources,
    faqs,
    facultyNeedsReview,
    coachInactive,
    coachNeedReview,
    resourceNoVerification,
    faqNoVerification,
  ] = await Promise.all([
    prisma.faculty.count(),
    prisma.ascCoach.count(),
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
    prisma.resource.count({ where: { lastVerified: null } }),
    prisma.faq.count({ where: { lastVerified: null } }),
  ]);

  return {
    totals: { faculties, coaches, resources, faqs },
    risk: {
      facultyNeedsReview,
      coachInactive,
      coachNeedReview,
      resourceNoVerification,
      faqNoVerification,
    },
  };
  },
  ["health-overview"],
  { tags: [ADMIN_CACHE_TAGS.health, ADMIN_CACHE_TAGS.faculties, ADMIN_CACHE_TAGS.coaches, ADMIN_CACHE_TAGS.resources, ADMIN_CACHE_TAGS.faqs], revalidate: 120 },
);

